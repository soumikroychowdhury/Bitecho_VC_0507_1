import fs from 'fs/promises';
import path from 'path';
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
};