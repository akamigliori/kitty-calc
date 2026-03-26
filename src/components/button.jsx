function Button({ value, onClick, className }) {
  return (
    <button
      onClick={onClick}
      // Adicionei flex, items-center e justify-center para garantir que o texto do botão fique bem no meio!
      className={`p-4 rounded-full font-bold text-xl shadow-md transition-all active:scale-95 flex items-center justify-center ${className}`}
    >
      {value}
    </button>
  )
}

export default Button