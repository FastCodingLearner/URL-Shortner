const {readFile, writeFile} = require("fs/promises")
const {createServer} = require("http")
const path = require('path')
const crypto = require("crypto")




const filePath = path.join("public","data","links.json")


const serverFile = async (res,file,content)=>{
       try{
                const  data = await readFile(path.join("public",file))
                res.writeHead(200,{
                    "Content-Type" : content
                })
                res.end(data)

            }catch(error){
                res.writeHead(404,{
                    "Content-Type" : content
                })
                res.end("Something is wrong")
            }
        }
        

const shortLinks = async ()=>{
    try{
        const data = await readFile(filePath,"utf-8");
        return JSON.parse(data)
    }catch(error){
        
        if(error.code === "ENOENT"){
            await writeFile(filePath,JSON.stringify({}))
            return {}
        }
        
    }
    
    
}

const saveLinks = async (links)=>{
    await writeFile(filePath,JSON.stringify(links))
  
}

const server = createServer(async (req,res)=>{
    if(req.method==='GET'){
        if(req.url==='/'){
            await  serverFile(res,"url.html","text/html")
        }
        else if(req.url === '/style.css'){
            await serverFile(res,"style.css","text/css")
            
        }else if(req.url==='/links'){
        const links =  await shortLinks()
         

        res.writeHead(200,{"Content-Type" : "appliation/json"})
        return res.end(JSON.stringify(links))
    }
    else{
        const links = await shortLinks()
        const shortLink = req.url.slice(1)
        console.log(links)
        
        console.log("this : "+links[shortLink])

        if(links[shortLink]){
            res.writeHead(302,{location :links[shortLink] })
            return res.end()
        }

        res.writeHead(404,{"Content-Type" : "application/json"})
        return res.end("Shorted URL is not found")
    }
        
    }
    else if(req.url === '/shorten',req.method==='POST'){
        const links =  await shortLinks()
        // console.log("Links : "+links)
        
        let body =''
        req.on("data",(value)=>{
            body +=value
        })

       req.on('end', async ()=>{
        const {url,shortUrl} = JSON.parse(body);
       
        if(!url){
            res.writeHead(404,{"Content-Type":"text/plain"})
            return res.end("Please Give URL Again")
        }

        const finalShortUrl = shortUrl || crypto.randomBytes(16).toString("hex") ;

        if(links[finalShortUrl]){
            res.writeHead(404,{"Content-Type" : "plain/text"})
            return alert("This short url already exits. please try again later")
        }

        links[finalShortUrl] = url;
         
        await saveLinks(links)

        res.writeHead(200,{"Content-Type" : "apalication/json"})
        res.end(JSON.stringify({Success : true,shortUrl : finalShortUrl}))
        


        
       
       })

       
    }

    
})


server.listen(3000,(port)=>{
    console.log(`Server listen in 3000`)
})
