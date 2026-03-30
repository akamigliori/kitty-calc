// src/components/Display.jsx
import 'mathlive'
import { useEffect, useCallback, useRef } from 'react'

function Display({ mfRef, onCalculate, onClear }) {
  const containerRef = useRef(null)
  
  const abrirTeclado = useCallback(() => {
    if (mfRef.current) {
      mfRef.current.virtualKeyboardMode = "onfocus"
      mfRef.current.virtualKeyboardPosition = "top"
      mfRef.current.openVirtualKeyboard()
      
      setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 100)
    }
  }, [mfRef])

  useEffect(() => {
    if (!mfRef.current) return

    mfRef.current.virtualKeyboardMode = "onfocus"
    mfRef.current.virtualKeyboardPosition = "top"
    mfRef.current.virtualKeyboards = "all"

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault()
        if (onCalculate) onCalculate()
      }
    }

    const handleKeyboardOpen = () => {
      containerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }

    mfRef.current.addEventListener('keydown', handleKeyDown)
    mfRef.current.addEventListener('virtual-keyboard-toggle', handleKeyboardOpen)

    return () => {
      mfRef.current?.removeEventListener('keydown', handleKeyDown)
      mfRef.current?.removeEventListener('virtual-keyboard-toggle', handleKeyboardOpen)
    }
  }, [mfRef, onCalculate])

  return (
    <div 
      ref={containerRef}
      className="bg-pink-200 text-pink-900 p-4 md:p-6 rounded-2xl text-3xl md:text-4xl mb-4 md:mb-6 shadow-inner min-h-[6rem] md:min-h-[8rem] flex items-center justify-center border-2 border-pink-300"
    >
      <math-field 
        ref={mfRef}
        virtual-keyboard-mode="onfocus"
        virtual-keyboard-position="top"
        virtual-keyboards="all"
        onfocus={() => abrirTeclado()}
        style={{ 
          width: '100%', 
          backgroundColor: 'transparent', 
          border: 'none', 
          outline: 'none',
          fontFamily: 'inherit',
          textAlign: 'center',
          fontSize: '1.5rem'
        }}
      >
      </math-field>
    </div>
  )
}

export default Display