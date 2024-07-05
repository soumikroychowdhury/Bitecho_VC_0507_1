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
};