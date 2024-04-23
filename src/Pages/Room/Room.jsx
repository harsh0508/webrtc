import { addDoc, collection, doc, onSnapshot } from "firebase/firestore"
import { useEffect, useRef, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { firestore } from "../../firebase"
import { captureScreen, getPeercurrent, localStream, openCamera, pausePlay, pc, remoteStream, setRemoteDesc, stop } from "../../Provider/provider"
import './Room.css'



export default function Room(...props){

    const {id}  = useParams()
    const [vid,gotVid] = useState(true)
    const videoRef = useRef()
    const [chat,setChat] = useState([{
        "type": true,
        "chat":`You can chat here, your room id is ${id}`
    }])

    const [chatData , set] = useState('')

    const [play,setplay] = useState(true)

    const navigate = useNavigate()

    const stopStream = async()=>{
        await stop()
        navigate('/')
    }

    const pp = async()=>{
        pausePlay(vid)
        gotVid(!vid)
    }


    const sendText = async()=>{
        const doc = document.getElementById('chat-text')
                if(chatData !== ''){
                    const callDoc = await addDoc(collection(firestore,"rooms",id,"chat"),{
                        "type":true,
                        "chat":chatData
                    })
                    console.log("Document written with id :", callDoc.id)
                }
                else{
                    console.log('chat is empty' , chatData)
                }
            doc.value= ''
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
        const lookOut = onSnapshot(collection(firestore,"rooms",id,"offerCandidates"),async(doc)=>{
            doc.docs.forEach(e=>{
                pc.addIceCandidate(new RTCIceCandidate(e.data()))
            })
        })
    })

    useEffect(()=>{
        const chat  = onSnapshot(collection(firestore,"rooms",id,"chat"),async(doc)=>{
            doc.docChanges().forEach(e=>{
                setChat(old=>[...old,e.doc.data()])
            })
        })
    },[])
    
    

    return(
        <div>
            <video autoPlay id='big-screen-vid'>
            </video>
            <div id='big-screen'>
                {
                    // big screen
                    (vid === null || vid === undefined)?
                    <div>
                        <button >Open web cam</button>
                    </div>
                    :
                    <video autoPlay autoFocus ref={videoRef} id="small-screen"></video>

                }
            </div>
            <div className="control">
                <button onClick={()=>pp()}>Hide video</button>
                <button onClick={()=>stopStream()}>End video</button>
                <button onClick={()=>captureScreen()}>Share Screen</button>
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