
import { useNavigate } from 'react-router-dom'
import { createRoom, joinRomm, openCamera, pc } from '../../Provider/provider'
import './Join.css'
import { useEffect, useState } from 'react'

export default function Join(){


    const navigate = useNavigate()

    const [error, setError] = useState(true)

    const [rid,setId] = useState('')

    const makeRoom = async()=>{
        const val = await openCamera()
        if (!val.val)
            return
        const roomID = await createRoom()
        if(roomID === 'NA'){
            setError(false)
            return
        }
        navigate(`/Room/${roomID}`)
    }

    const join = async ()=>{
        const val = await openCamera()
        if (!val.val || rid.length !== 20)
            return
        const roomID = await joinRomm(rid)
        console.log(roomID)
        if(roomID === 'NA'){
            setError(false)
            return
        }
        navigate(`/AnswerRoom/${rid}`)
    }




    return(
        <>
            <div style={{display:"flex",flexDirection:'column', width:'250px',height:'50vh',alignItems:"center",justifyContent:'space-between',margin:'auto'}}>
                <h1>Harsh WebRTC Chat room</h1>
                <button onClick={()=>{makeRoom()}}>Create new room</button>
                <input  onChange={(e)=>setId(e.target.value)} type="text" name="" id="" placeholder='Room id' />
                <button onClick={()=>{join()}}>Join A Call</button>
            </div>
        </>
    )
}