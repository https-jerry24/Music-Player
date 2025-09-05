
let title;
let currSong= new Audio();
let play=document.querySelector(".play1")
let previous=document.querySelector(".previous")
let next=document.querySelector(".next")
let currFolder;


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currFolder=folder


    let songsList= await fetch(`/${folder}/`)
    let songs = await songsList.text();
    let div=document.createElement("div")
    div.innerHTML = songs;

    let array = div.getElementsByTagName("a");
    title=[]
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if(element.href.endsWith(".mp3")){
            title.push(element.href.split(`/${folder}/`)[1])
        }   
    }



    // Show all the songs in the playlist
    let songList= document.querySelector(".library-list").getElementsByTagName("ul")[0];
    songList.innerHTML=""
    for (const song of title) {
        songList.innerHTML = songList.innerHTML + `
                <li>
                <div  class="library-card">
                <img src="/img/music.svg" alt="">
                <div>${song.replaceAll("%20"," ")}</div>
                <div class="playnow">
                    <span>Play Now</span>
                    <div class = "play"><img src="/img/play.svg" alt=""></div>
                    </div>
            </div>
            
        </li>`;
    }


    //getting location of song
    Array.from(document.querySelector(".library-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element=>{
            playMusic(e.querySelector(".library-card").firstElementChild.nextElementSibling.innerHTML.trim());
            
        })
    })
    return title;
}

const playMusic=(track , pause=false)=>{
    currSong.src= `/${currFolder}/`+track;

    if(!pause){
    currSong.play();
    play.src = "/img/pause.svg"
    }

    document.querySelector(".playbar-title").innerHTML= decodeURI( track);
}


async function getAlbums(){
    let albumList= await fetch(`/songs/`);
    let a = await albumList.text();
    let div=document.createElement("div");
    div.innerHTML=a;
    let anchors=div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".right-list");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];

            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="right-card">
                <img src="/songs/${folder}/cover.jpg" alt="">
                <div class="card-info">
                <div class="right-card-title">${response.title}</div>
                <div class="right-card-des">${response.description}</div>
                <img  class="album-play" src="/img/albumPlay.svg" alt="">
                </div>
            </div>`;
        }}


            Array.from(document.getElementsByClassName("right-card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            title = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(title[0])

        })
    })
        
    }

async function main(){

    //Playing song
    let songs = await getSongs("songs/CHILL");
    playMusic(songs[0], true);

    await getAlbums()


    //playbar Play and Pause
    play.addEventListener("click", ()=>{
        if(currSong.paused){
            currSong.play();
            play.src="/img/pause.svg";
        }
        else{
            currSong.pause();
            play.src="/img/play.svg";
        }
    })

    //Duration of Song
    currSong.addEventListener("timeupdate",()=>{
       document.querySelector(".duration").innerHTML = `${secondsToMinutesSeconds(currSong.currentTime)} / ${secondsToMinutesSeconds(currSong.duration)}`;
       document.getElementById('seekbar').value= (currSong.currentTime / currSong.duration) * 100;
    })
        document.getElementById('seekbar').addEventListener('input', function() {
            let percent= document.getElementById('seekbar').value;
        currSong.currentTime = ((currSong.duration) * percent) / 100;
});
    


    previous.addEventListener("click", ()=>{
        currSong.pause();
        let index= title.indexOf(currSong.src.split("/").slice(-1)[0]);
        if((index-1)>=0){
            playMusic(title[index-1]);
        }
    })

    next.addEventListener("click", ()=>{
        currSong.pause();
        let index= title.indexOf(currSong.src.split("/").slice(-1)[0]);
        if((index+1)>=0){
            playMusic(title[index+1]);
        }
    })


    //Volume
    document.getElementById('volumeRange').addEventListener("change",(e)=>{
        currSong.volume = parseInt(e.target.value)/100;
        console.log(currSong.volume)
    })
}

main()