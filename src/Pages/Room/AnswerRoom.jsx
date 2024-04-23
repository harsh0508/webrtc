import { addDoc, collection, doc, onSnapshot } from "firebase/firestore"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { firestore } from "../../firebase"
import { getPeercurrent, localStream, openCamera, pausePlay, pc, remoteStream, setRemoteDesc, stop } from "../../Provider/provider"
import './Room.css'



export default function AnswerRoom(...props){

    const {id}  = useParams()
    const [vid,gotVid] = useState(false)
    const videoRef = useRef()
    const [chat,setChat] = useState([{
        "type": false,
        "chat":`You can chat here, your room id is ${id}`
    }])

    const [chatData , set] = useState('')
    const navigate = useNavigate()

    const stopStream = async()=>{
        await stop()
        navigate('/')
        
    }

    const pp = async()=>{
        pausePlay(vid)
        gotVid(!vid)
    }

    const openWebCam = async()=>{
        
        gotVid(true)
        const val = await openCamera()
        if(val.val)
            {
                const vid = document.getElementById('big-screen-vid')
                console.log(vid)
                vid.srcObject = val.vid
                const smallvid = document.getElementById('small-screen')
                smallvid.srcObject = val.remote 
            }
        else
            gotVid(false)
    }

    const sendText = async()=>{
        const doc = document.getElementById('chat-text')
                if(chatData !== ''){
                    const callDoc = await addDoc(collection(firestore,"rooms",id,"chat"),{
                        "type":false,
                        "chat":chatData
                    })
                    console.log("Document written with id :", callDoc.id)
                }
                else{
                    console.log('chat is empty' , chatData)
                }
            }


    useEffect(()=>{
        const vid = document.getElementById('big-screen-vid')
                console.log(vid)
                vid.srcObject = localStream
                const smallvid = document.getElementById('small-screen')
                smallvid.srcObject = remoteStream
    },[])


    useEffect(()=>{
        const unsub = onSnapshot(doc(firestore,"rooms",id), async(doc)=>{
           const data = doc.data()
           const status  = await getPeercurrent()
           console.log(data.answer)
           if(!status && data.answer){
                console.log("set remote description", data.answer)
                await setRemoteDesc(data.answer)
           }
        })
    },[])


   


    useEffect(()=>{
       const lookOut = onSnapshot(collection(firestore,"rooms",id,"answerCandidates"), async(doc)=>{
        doc.docs.forEach(e=>{
            pc.addIceCandidate(new RTCIceCandidate(e.data()))
        })
       })
    },[])

    useEffect(()=>{
        const chat  = onSnapshot(collection(firestore,"rooms",id,"chat"),async(doc)=>{
            doc.docChanges().forEach(e=>{
                setChat(old=>[...old,e.doc.data()])
            })
        })
    },[])
    
    

    return(
        <div>
            <video autoPlay id='small-screen'>
            </video>
            <div id='big-screen'>
                {
                    // big screen
                    (vid === null || vid === undefined)?
                    <div>
                        <button onClick={()=>openWebCam()}>Open web cam</button>
                    </div>
                    :
                    <video autoPlay autoFocus ref={videoRef} id="big-screen-vid"></video>

                }
            </div>
            <div className="control">
                <button onClick={()=>pp()}>Hide video</button>
                <button onClick={()=>stopStream()}>End video</button>
            </div>
            <div className="chat">
                {
                    // chantBox
                    <div className='chat-box'>
                       { chat.map(e=><p style={{textAlign:(e.type?"start":"end"),
                     backgroundColor:(e.type?"green":"blue"),margin:'2%',borderRadius:'10px',padding:'5px'}}>
                        {e.chat}</p>)}
                    </div>
                }
                <div className="chat-input">
                    <input onChange={(e)=>set(e.target.value)} id='chat-text' type="text" />
                    <button onClick={()=>sendText()}>Send</button>
                </div>
            </div>
        </div>
    )
}