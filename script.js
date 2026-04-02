console.log('lets write js');
let currentSong = new Audio();
let songs;


const play = document.getElementById("play");
const next = document.getElementById("next");
const prev = document.getElementById("prev");






async function getFolders() {
    let res = await fetch("./folders.json");
    return await res.json();
}



async function loadFolderSongs(folder){
    let res = await fetch(`./Songs/${folder}/songs.json`);
    let folderSongs = await res.json();  

    songUL.innerHTML = "";
    songs = [];
folderSongs.forEach(song => {
    

    let trackName = song.file.split("/").pop().replace(".mp3", "");

    songs.push({
        folder: folder,
        track: trackName
    });

    songUL.innerHTML += `
      <li data-folder="${folder}" data-track="${trackName}">
          <img class="invert" src="music.svg">
          <div class="info">
              <div>${trackName.replaceAll("_"," ")}</div>
              <div>Song Artist</div>
          </div>
          <div class="playnow">
              <span>Play Now</span>
              <img src="play.svg">
          </div>
      </li>
    `;
});

     Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.dataset.folder, e.dataset.track);
        });
    });
    //  Auto play first song when folder changes
if (songs.length > 0) {
    playMusic(songs[0].folder, songs[0].track);
}

}
async function main() {

    songUL = document.querySelector(".songlist ul");

    let folders = await getFolders();

    // Load first folder songs by default
    await loadFolderSongs(folders[0]);
    await displayFolderCards();

}





const playMusic = (folder, track) => {

    currentSong.src = `./Songs/${folder}/${track}.mp3`;

    currentSong.play();
   document.getElementById("play").src = "pause.svg"; 
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}





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




//Attach an event listener to play, next and prev
play.addEventListener("click", () => {
    if (currentSong.paused) {
        currentSong.play();
        play.src = "pause.svg";


    }
    else {
        currentSong.pause();
        play.src = "playmid.svg";
    }
})

//Listen for time update event
currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
});

//Add event listener to seek bar
document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
})


//Add an event listener for hamburger

document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0px";
})


//Add an event listener for close
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
})



next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");

    if (!currentSong.src) return;

    let currentTrack = decodeURIComponent(
        currentSong.src.split("/").pop().replace(".mp3", "")
    );

    let index = songs.findIndex(song => song.track === currentTrack); 

    if (index === -1) return;

    if (index < songs.length - 1) {
        playMusic(songs[index + 1].folder, songs[index + 1].track);
    } else {
        playMusic(songs[0].folder, songs[0].track); // loop to first
    }
});

prev.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");

    if (!currentSong.src) return;

    let currentTrack = decodeURIComponent(
        currentSong.src.split("/").pop().replace(".mp3", "")
    );

    let index = songs.findIndex(song => song.track === currentTrack);

    if (index === -1) return;

    if (index > 0) {
        playMusic(songs[index - 1].folder, songs[index - 1].track);
    } else {
        playMusic(songs[songs.length - 1].folder, songs[songs.length - 1].track);
    }
});

currentSong.addEventListener("ended", () => {
    next.click();
});



//Add an event to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
})//parseInt used toi change string to integer then divide by 100 to give decimal no as vol is set b/w 1-0

async function displayFolderCards() {
    let folders = await getFolders();

    let cardsContainer = document.querySelector(".cardContainer");

    cardsContainer.innerHTML = ""; // clear old cards

    folders.forEach(folder => {
        cardsContainer.innerHTML += `
            <div class="card" data-folder="${folder}">
                <div class="play">
                    <img src="play.svg">
                </div>

                <img class = "cover" src="./Songs/${folder}/cover.jpg">

                <h2>${folder}</h2>
                <p>Click to view songs</p>
            </div>
        `;
    });
Array.from(document.querySelectorAll(".card")).forEach(card =>{
    card.addEventListener("click", ()=>{
        let folderName = card.dataset.folder;
        loadFolderSongs(folderName);
    });
});
 
}

main();