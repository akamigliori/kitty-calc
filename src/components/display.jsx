// src/components/Display.jsx
import 'mathlive'
import { useEffect } from 'react'

// Removemos o setExpressao daqui!
function Display({ mfRef }) {
  
  useEffect(() => {
    // Como o MathLive já guarda o que foi digitado dentro dele mesmo (mfRef.current.value),
    // não precisamos mais ficar avisando o React a cada letrinha digitada.
    // Menos código, aplicativo mais rápido! 🚀
  }, [mfRef]);

  return (
    <div className="bg-pink-200 text-pink-900 p-6 rounded-2xl text-4xl mb-6 shadow-inner min-h-[8rem] flex items-center justify-center border-2 border-pink-300">
      <math-field 
        ref={mfRef} 
        style={{ 
          width: '100%', 
          backgroundColor: 'transparent', 
          border: 'none', 
          outline: 'none',
          fontFamily: 'inherit',
          textAlign: 'center'
        }}
      >
      </math-field>
    </div>
  )
}

export default Display