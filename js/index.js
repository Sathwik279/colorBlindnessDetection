
let images = []
async function getImages(){
  let a = await fetch('http://127.0.0.1:5501/images/')
  let response = await a.text();
  console.log(response)
  let div = document.createElement('div');
  div.innerHTML = response;
  let im = div.getElementsByTagName('a')
 
  for(let index=0;index<im.length;index++){
    const element = im[index]
    if(element.href.endsWith('.png'))
    {
      images.push(element.href)
    }
    
  }
  console.log(images)
}

getImages();

const start = document.getElementById("start");
let index = 0;
start.addEventListener("click",()=>{

  index++;
  console.log(index);
  
    if(index<images.length){
      window.prompt("image is successfully displayed")
      const image1 = document.getElementById("image1");
      image1.src = images[index];
    }
    else
    {
      window.prompt("displaying of image is unsuccessful")
    }
  })

