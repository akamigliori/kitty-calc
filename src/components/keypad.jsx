// src/components/Keypad.jsx - Teclado otimizado para mobile/touch

import Button from './button'

function Keypad({ aoClicar, aoApagar }) {
  const styleNumero = "bg-pink-100 text-pink-700 hover:bg-pink-200 active:bg-pink-300"
  const styleOperador = "bg-pink-300 text-pink-900 hover:bg-pink-400 active:bg-pink-500"
  const styleAcao = "bg-rose-400 text-white hover:bg-rose-500 active:bg-rose-600"
  const styleVar = "bg-purple-200 text-purple-800 hover:bg-purple-300 active:bg-purple-400"

  // Mapeia texto para comandos LaTeX do mathlive
  const handleClick = (valor, latex = null) => {
    if (valor === 'DEL') {
      aoApagar()
    } else if (latex) {
      aoClicar(valor, latex)
    } else {
      aoClicar(valor)
    }
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      
      {/* Linha 1: Funções matemáticas */}
      <Button value="sin" className={styleOperador} onClick={() => handleClick("sin", "\\sin(")} />
      <Button value="cos" className={styleOperador} onClick={() => handleClick("cos", "\\cos(")} />
      <Button value="tan" className={styleOperador} onClick={() => handleClick("tan", "\\tan(")} />
      <Button value="⌫" className={styleAcao} onClick={() => handleClick("DEL")} />

      {/* Linha 2: Cálculo avançado */}
      <Button value="lim" className={styleOperador} onClick={() => handleClick("lim", "\\lim_{x\\to }")} />
      <Button value="∫" className={styleOperador} onClick={() => handleClick("int", "\\int ")} />
      <Button value="d/dx" className={styleOperador} onClick={() => handleClick("d/dx", "\\frac{d}{dx}")} />
      <Button value="÷" className={styleOperador} onClick={() => handleClick("/", "\\frac{}{}")} />

      {/* Linha 3: Potência, raiz, parênteses */}
      <Button value="^" className={styleOperador} onClick={() => handleClick("^", "^{}")} />
      <Button value="√" className={styleOperador} onClick={() => handleClick("sqrt", "\\sqrt{}")} />
      <Button value="(" className={styleOperador} onClick={() => handleClick("(")} />
      <Button value=")" className={styleOperador} onClick={() => handleClick(")")} />

      {/* Linha 4: Números 7-9 e funções */}
      <Button value="7" className={styleNumero} onClick={() => handleClick("7")} />
      <Button value="8" className={styleNumero} onClick={() => handleClick("8")} />
      <Button value="9" className={styleNumero} onClick={() => handleClick("9")} />
      <Button value="×" className={styleOperador} onClick={() => handleClick("*", "\\cdot ")} />

      {/* Linha 5: Números 4-6 */}
      <Button value="4" className={styleNumero} onClick={() => handleClick("4")} />
      <Button value="5" className={styleNumero} onClick={() => handleClick("5")} />
      <Button value="6" className={styleNumero} onClick={() => handleClick("6")} />
      <Button value="-" className={styleOperador} onClick={() => handleClick("-")} />

      {/* Linha 6: Números 1-3 */}
      <Button value="1" className={styleNumero} onClick={() => handleClick("1")} />
      <Button value="2" className={styleNumero} onClick={() => handleClick("2")} />
      <Button value="3" className={styleNumero} onClick={() => handleClick("3")} />
      <Button value="+" className={styleOperador} onClick={() => handleClick("+")} />

      {/* Linha 7: Variável, 0, decimal */}
      <Button value="x" className={styleVar} onClick={() => handleClick("x")} />
      <Button value="0" className={styleNumero} onClick={() => handleClick("0")} />
      <Button value="." className={styleNumero} onClick={() => handleClick(".")} />
      <Button value="=" className={styleAcao} onClick={() => handleClick("=")} />
      
    </div>
  )
}

export default Keypad