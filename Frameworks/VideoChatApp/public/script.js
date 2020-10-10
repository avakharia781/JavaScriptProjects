const socket = io('/');
const peer = new Peer(undefined, {
    path : '/peerjs',
    host : '/',
    port : 443
});
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
let myVideoStream;

myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream =>{
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', userId => {
        setTimeout(function ()
        {
          connectNewUser(userId, stream);
        },1000) 
    })
});

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', ()=>{
        video.play();
    });
    videoGrid.append(video);
}

//*****************Socket Connection*****************/
peer.on('open', id=>{
    socket.emit('join-room', ROOM_ID, id);
})

var connectNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    })
}

let textMessage = $('input');

$('html').keydown((e) => {
    if(e.which == 13 && textMessage.val().length !== 0){
        socket.emit('message', textMessage.val());
        textMessage.val('');
    }
})

socket.on('createMessage', message=>{
    $('#message').append(`<li class='message'><b>user</b><br/>${message}</li>`);
    let d = $('.main__chat__window');
    d.scrollTop(d.prop('scrollHeight'));
});

socket.on('disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

//******************Button Sections****************/
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    var html = '';
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        html = `
        <i class='unmute fas fa-microphone-slash'></i>
        <span>Unmute</span>
        `        
    }else{
        myVideoStream.getAudioTracks()[0].enabled = true;
        html = `
        <i class='fas fa-microphone'></i>
        <span>Mute</span>
        `        
    }

    document.querySelector('.main__mute__button').innerHTML = html;
}

const playStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    var html = '';
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled = false;
        html = `
        <i class='play fas fa-video-slash'></i>
        <span>Play Video</span>
        `        
    }else{
        myVideoStream.getVideoTracks()[0].enabled = true;
        html = `
        <i class='fas fa-video'></i>
        <span>Stop Video</span>
        `        
    }

    document.querySelector('.main__play__button').innerHTML = html;    
}

