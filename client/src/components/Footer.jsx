import React from 'react'

import { assets } from '../assets/assets'

const Footer = () => {
  return (
    
        <div className='flex items-center justify-between gap-4 py-3 px-4 lg:px-44 '>
          <img width={150} src={assets.logo} alt="" />
          <span className='text-gray-500 ' >|</span>
           <p  className='flex-1 pl-1 text-sm text-gray-500 max-sm:hidden'>Copyright @GovindYadav. | All right reserved.</p>
        
        
        <div className='flex gap-1'>
            <img  width={40} src={assets.facebook_icon} alt="" />
            <img width={40} src={assets.twitter_icon}alt="" />
            <img width={40} src={assets.google_plus_icon} alt="" />
        </div>

    </div>
  )
}

export default Footer