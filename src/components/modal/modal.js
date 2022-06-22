import React from 'react'
import '../modal/modal.css'

const Modal = ({title,content,close}) => {
  return (
    <div>
      <div className='modl'>
      <div className='modal_container'>
        <div className='_close' onClick={()=>close()}>&times;</div>
        <div className='model_title'>
          {title}
        </div>
        <div className='model_content'>
          {content}
        </div>
        <div className='modal_footer'>
        <button className='btn' onClick={()=> close()}>Close</button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Modal