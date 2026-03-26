// src/components/Keypad.jsx

import Button from './button'

function Keypad({ aoClicar }) {
  const styleNumero = "bg-pink-100 text-pink-700 hover:bg-pink-200"
  const styleOperador = "bg-pink-300 text-pink-900 hover:bg-pink-400"
  const styleAcao = "bg-rose-400 text-white hover:bg-rose-500"
  const styleVar = "bg-purple-200 text-purple-800 hover:bg-purple-300"

  return (
    <div className="grid grid-cols-5 gap-2">
      
      {/* Linha 1: Trigonometria e Ações */}
      <Button value="sin" className={styleOperador} onClick={() => aoClicar("sin", "\\sin(\\placeholder{})")} />
      <Button value="cos" className={styleOperador} onClick={() => aoClicar("cos", "\\cos(\\placeholder{})")} />
      <Button value="tan" className={styleOperador} onClick={() => aoClicar("tan", "\\tan(\\placeholder{})")} />
      <Button value="C" className={styleAcao} onClick={() => aoClicar("C")} />
      {/* O nosso tão pedido botão de Apagar (Backspace)! */}
      <Button value="⌫" className={styleAcao} onClick={() => aoClicar("DEL")} />

      {/* Linha 2: Cálculo Avançado com Placeholders */}
      <Button value="lim" className={styleOperador} onClick={() => aoClicar("lim", "\\lim_{x \\to \\placeholder{}} \\placeholder{}")} />
      <Button value="∫" className={styleOperador} onClick={() => aoClicar("∫", "\\int_{\\placeholder{}}^{\\placeholder{}} \\placeholder{} \\,dx")} />
      <Button value="d/dx" className={styleOperador} onClick={() => aoClicar("d/dx", "\\frac{d}{dx} (\\placeholder{})")} />
      <Button value="^" className={styleOperador} onClick={() => aoClicar("^", "^{\\placeholder{}}")} />
      <Button value="√" className={styleOperador} onClick={() => aoClicar("√", "\\sqrt{\\placeholder{}}")} />

      {/* Linha 3: Variáveis e Números */}
      <Button value="x" className={styleVar} onClick={() => aoClicar("x")} />
      <Button value="7" className={styleNumero} onClick={() => aoClicar("7")} />
      <Button value="8" className={styleNumero} onClick={() => aoClicar("8")} />
      <Button value="9" className={styleNumero} onClick={() => aoClicar("9")} />
      <Button value="/" className={styleOperador} onClick={() => aoClicar("/", "\\frac{\\placeholder{}}{\\placeholder{}}")} />

      {/* Linha 4: Mais Variáveis e Números */}
      <Button value="y" className={styleVar} onClick={() => aoClicar("y")} />
      <Button value="4" className={styleNumero} onClick={() => aoClicar("4")} />
      <Button value="5" className={styleNumero} onClick={() => aoClicar("5")} />
      <Button value="6" className={styleNumero} onClick={() => aoClicar("6")} />
      <Button value="*" className={styleOperador} onClick={() => aoClicar("\\cdot ")} />

      {/* Linha 5: Parênteses e Números */}
      <Button value="(" className={styleOperador} onClick={() => aoClicar("(")} />
      <Button value="1" className={styleNumero} onClick={() => aoClicar("1")} />
      <Button value="2" className={styleNumero} onClick={() => aoClicar("2")} />
      <Button value="3" className={styleNumero} onClick={() => aoClicar("3")} />
      <Button value="-" className={styleOperador} onClick={() => aoClicar("-")} />

      {/* Linha 6: Finalização */}
      <Button value=")" className={styleOperador} onClick={() => aoClicar(")")} />
      <Button value="0" className={styleNumero} onClick={() => aoClicar("0")} />
      <Button value="." className={styleNumero} onClick={() => aoClicar(".")} />
      <Button value="=" className={styleAcao} onClick={() => aoClicar("=")} />
      <Button value="+" className={styleOperador} onClick={() => aoClicar("+")} />
      
    </div>
  )
}

export default Keypad