#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import {diffLines} from 'diff';
import chalk from 'chalk';
import {Command} from 'commander';
const a=new Command();

class Bitecho{
    async init(){
        await fs.mkdir(this.objectsPath,{recursive:true});
        try{
            await fs.writeFile(this.headPath,'',{flag:'wx'});
            await fs.writeFile(this.indexPath,JSON.stringify([]),{flag:'wx'});
        }catch(e){
            console.log("Already initialised the .bitecho folder");
        }
    }
    constructor(repoPath='.'){
        this.repoPath=path.join(repoPath,'.bitecho');
        this.objectsPath=path.join(this.repoPath,'objects');
        this.headPath=path.join(this.repoPath,'HEAD');
        this.indexPath=path.join(this.repoPath,'index');
        this.init();
    }
    hashObject(content){
        return crypto.createHash('sha1').update(content,'utf-8').digest('hex');
    }
    async updateStagingArea(filePath,fileHash){
        const index=JSON.parse(await fs.readFile(this.indexPath,{encoding:'utf-8'}));
        index.push({path:filePath,hash:fileHash});
        await fs.writeFile(this.indexPath,JSON.stringify(index));
    }
    async add(fileToBeAdded){
        const fileData=await fs.readFile(fileToBeAdded,{encoding:'utf-8'});
        const fileHash=this.hashObject(fileData);
        console.log(fileHash);
        const newFileHashedObjectPath=path.join(this.objectsPath,fileHash);
        await fs.writeFile(newFileHashedObjectPath,fileData);
        await this.updateStagingArea(fileToBeAdded,fileHash);
        console.log(`Added ${fileToBeAdded}`);
    }
    async getCurrentHead(){
        try{
            return await fs.readFile(this.headPath,{encoding:'utf-8'});
        }catch(e){
            return null;
        }
    }
    async commit(message){
        const index=JSON.parse(await fs.readFile(this.indexPath,{encoding:'utf-8'}));
        const parentCommit=await this.getCurrentHead();
        const commitData={
            timeStamp:new Date().toISOString(),
            message,
            files:index,
            parent:parentCommit
        };
        const commitHash=this.hashObject(JSON.stringify(commitData));
        const commitPath=path.join(this.objectsPath,commitHash);
        await fs.writeFile(commitPath,JSON.stringify(commitData));
        await fs.writeFile(this.headPath,commitHash);
        await fs.writeFile(this.indexPath,JSON.stringify([]));
        console.log(`Committed ${commitHash}`);
    }
    async log(){
        let commitHash=await this.getCurrentHead();
        while(commitHash){
            const commitData=JSON.parse(await fs.readFile(path.join(this.objectsPath,commitHash),{encoding:'utf-8'}));
            console.log(`---------------------\n`);
            console.log(`Commit: ${commitHash}`);
            console.log(`Time Stamp: ${commitData.timeStamp}`);
            console.log(`Message: ${commitData.message}`);
            commitHash=commitData.parent;
        }
    }
    async getCommit(commitHash){
        const commitPath=path.join(this.objectsPath,commitHash);
        try{
            return await fs.readFile(commitPath,{encoding:'utf-8'});
        }catch(e){
            console.log(`Commit ${commitHash} not found`);
            return null;
        }
    }
    async getFileContent(fileHash){
        const filePath=path.join(this.objectsPath,fileHash);
        return fs.readFile(filePath,{encoding:'utf-8'});
    }
    async getParentFileContent(parentCommit,filePath){
        const parentFile=parentCommit.files.find(file=>file.path===filePath);
        if(parentFile){
            return this.getFileContent(parentFile.hash);
        }
    }
    async commitDiff(commitHash){
        const commitData=JSON.parse(await this.getCommit(commitHash));
        if(!commitData){
            console.log("Commit not found");
            return;
        }
        console.log(`Commit: ${commitHash}`);
        console.log("Changes in the commit are:");
        for(const file of commitData.files){
            console.log(`\nFile: ${file.path}`);
            const fileContent=await this.getFileContent(file.hash);
            if(commitData.parent){
                const parentCommit=JSON.parse(await this.getCommit(commitData.parent));
                const parentFileContent=await this.getParentFileContent(parentCommit,file.path);
                if(parentFileContent!==undefined){
                    console.log('Diff:');
                    const diff=diffLines(parentFileContent,fileContent);
                    diff.forEach(line=>{
                        if(line.added){
                            process.stdout.write(chalk.green(`++ ${line.value}`));
                        }else if(line.removed){
                            process.stdout.write(chalk.red(`-- ${line.value}`));
                        }else{
                            process.stdout.write(chalk.white(`   ${line.value}`));
                        }
                    });
                    console.log();
                }else{
                    console.log("::New file in this commit::");
                    console.log(fileContent);
                }
            }else{
                console.log("::First Commit::");
                console.log(fileContent);
            }
        }
    }
};
a.command('init').action(()=>new Bitecho().init());
a.command('add <file>').action((file)=>new Bitecho().add(file));
a.command('commit <message>').action((message)=>new Bitecho().commit(message));
a.command('log').action(()=>new Bitecho().log());
a.command('show <commitHash>').action((commitHash)=>new Bitecho().commitDiff(commitHash));
a.parse(process.argv);