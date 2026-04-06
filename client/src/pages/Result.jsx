import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'

const Result = () => {
  const {
    resultImage,
    image,
    removeBg,
    loading
  } = useContext(AppContext)

  return (
    <div className='mx-4 my-3 lg:mx-44 mt-14 min-h-[75vh]'>
      {/* Image Container */}
      <div className='bg-white rounded-lg px-8 py-6 drop-shadow-sm'>

        <div className='flex flex-col sm:grid grid-cols-2 gap-8'>

          {/* Left Side */}
          <div>
            <p className='font-semibold text-gray-600 mb-2'>Original</p>

            {image ? (
              <img
                className='rounded-md border w-full max-h-[500px] object-contain'
                src={URL.createObjectURL(image)}
                alt="original"
              />
            ) : (
              <div className='rounded-md border border-gray-300 h-64 flex items-center justify-center text-gray-400'>
                No image selected
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className='flex flex-col'>
            <p className='font-semibold text-gray-600 mb-2'>Background Removed</p>

            <div className='rounded-md border border-gray-300 h-full min-h-[300px] relative bg-layer overflow-hidden flex items-center justify-center'>
              {loading ? (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='border-4 border-violet-600 rounded-full h-12 w-12 border-t-transparent animate-spin'></div>
                </div>
              ) : resultImage ? (
                <img
                  className='rounded-md w-full max-h-[500px] object-contain'
                  src={resultImage}
                  alt="background removed"
                />
              ) : (
                <p className='text-gray-400'>No processed image yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className='flex justify-center sm:justify-end items-center flex-wrap gap-4 mt-6'>

          {/* Hidden Input */}
          <input
            onChange={(e) => removeBg(e.target.files[0])}
            type="file"
            accept="image/*"
            id="upload_again"
            hidden
          />

          {/* Try Another */}
          <label
            htmlFor="upload_again"
            className='px-8 py-2.5 text-violet-600 text-sm border border-violet-600 rounded-full hover:scale-105 transition-all duration-700 cursor-pointer'
          >
            Try Another image
          </label>

          {/* Download */}
          {resultImage && (
            <a
              className='px-8 py-2 text-white text-sm bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full hover:scale-105 transition-all duration-700'
              href={resultImage}
              download="bg-removed-image.png"
            >
              Download image
            </a>
          )}
        </div>

      </div>
    </div>
  )
}

export default Result