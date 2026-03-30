function Button({ value, onClick, className }) {
  return (
    <button
      onClick={onClick}
      onTouchStart={(e) => {
        e.preventDefault()
        onClick()
      }}
      className={`
        min-h-[52px] min-w-[52px] 
        p-2 md:p-3 
        rounded-xl font-bold text-lg md:text-xl 
        shadow-md transition-all active:scale-95 
        flex items-center justify-center
        select-none touch-manipulation
        ${className}
      `}
    >
      {value}
    </button>
  )
}

export default Button