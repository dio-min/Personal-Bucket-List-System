import React from 'react'
import Navigate from './Navigate'
import DisplayComplete from './ViewList/DisplayComplete'

function Album() {
  return (
    <>
      <Navigate />
      <div>
        <h1 className="text-3xl font-bold text-white p-4 " style={{display: "flex", justifyContent:"center"}}>My Adventure</h1>
    
        <div>
            <DisplayComplete />
        </div>
      </div>
    </>
  )
}

export default Album