import Calculator from './components/calculator'

function App() {
  return (
    // Fundo limpo, focado no mobile
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100 flex flex-col items-center justify-start pt-4 md:justify-center p-2 md:p-4 font-sans">
      
      <div className="z-10 w-full max-w-lg">
        <h1 className="text-4xl md:text-5xl font-extrabold text-pink-500 text-center mb-6 drop-shadow-sm tracking-tight">
          Kitty Calc <span className="inline-block animate-bounce">🎀</span>
        </h1>
        
        <Calculator />
      </div>

    </div>
  )
}

export default App