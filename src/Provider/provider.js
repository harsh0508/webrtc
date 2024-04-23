import { addDoc, collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { off } from "firebase/database";

const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
};

export const pc = new RTCPeerConnection(servers);
export let localStream = null;
export let remoteStream = null;
export let iceCandiate = []




export async function getPeercurrent(){
    return await pc.currentRemoteDescription
}


export async function setRemoteDesc(answer){
   try {
        const a = new RTCSessionDescription(answer)
        await pc.setRemoteDescription(a)
        console.log("done")
   } catch (error) {
        console.log(error)
   }
}



export async function openCamera(){
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video : true,
            audio : true
        })

        remoteStream = new MediaStream()
        // push audio and video to peer connection
        localStream.getTracks().forEach((track)=>{
            // adding tranck to local stream
            pc.addTrack(track,localStream)
        })
    
        pc.ontrack = e =>{
            e.streams[0].getTracks().forEach(track=>{
                remoteStream.addTrack(track)
            })
        }
        
        let count = 0
        pc.onicecandidate = (e) =>{
            // console.log(e.candidate)
           iceCandiate.push(e.candidate)
        }
        
        return{
            val:true,
            vid: localStream,
            remote:remoteStream
        }
    } catch (error) {
        return {
            val:false,
            vid:false
        }
    }
 
}

export async function createRoom(){
    try {


        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        console.log(offer.sdp)

      

        const roomOffer = {
           offer:{
                type:offer.type,
                sdp:offer.sdp
           }
        }

        const callDoc = await addDoc(collection(firestore,"rooms"),roomOffer)
        console.log("Document written with id :", callDoc.id)

        iceCandiate.forEach(async(e,i)=>{

            if(e !== null){
                console.log(e , " is on index " , i)
                const val = {
                    "candidate": e.candidate,
                    "sdpMLineIndex" : e.sdpMLineIndex,
                    "sdpMid" : e.sdpMid,
                    "usernameFragment": e.usernameFragment
                }
                await setDoc(doc(firestore,'rooms',`${callDoc.id}/answerCandidates/${i}`),val)
            }          
        })
        
        
        
        return callDoc.id

    } catch (error) {
        console.log(error)
        return "NA"
    }



    

}


export async function joinRomm(id){
    try {
        let offer 
        const querySnap = await getDocs(collection(firestore,"rooms"))
       
        
        querySnap.forEach(e=>{
            if(e.id === id){
                offer = e.data()
            }
        })
        if(offer === undefined || offer === null){
            return 'NA'
        }
        // offer.offer.sdp += '\n'
        console.log(offer)
        await pc.setRemoteDescription(offer.offer)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        

        const roomWithAnswer = {
            answer: {
                type: answer.type,
                sdp: answer.sdp
            }
        }
        const callDoc = await updateDoc(doc(firestore,'rooms',id),roomWithAnswer)

        console.log(iceCandiate.length)
        iceCandiate.forEach(async(e,i)=>{
            if(e !== null){
                console.log(e , " is on index " , i)
                const val = {
                    "candidate": e.candidate,
                    "sdpMLineIndex" : e.sdpMLineIndex,
                    "sdpMid" : e.sdpMid,
                    "usernameFragment": e.usernameFragment
                }
                await setDoc(doc(firestore,'rooms',`${id}/offerCandidates/${i}`),val)
            }
            else{
                console.log(e , i)
            }
        })


        return callDoc

    } catch (error) {
        console.log(error)
        return 'NA'
    }
}



export async function pausePlay(p){
    localStream.getTracks().forEach((track)=>{
        track.enabled = p
    })
}

export async function stop(p){
    localStream.getTracks().forEach((track)=>{
        track.stop()
    })
}


export async function captureScreen(){
    let mediaStream = null
    try {
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video:{
            }
            ,
            audio:true
        })
        localStream = mediaStream
    } catch (error) {
        
    }
}


