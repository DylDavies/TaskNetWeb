interface Props {
    text: string,
    func: () => void,
    color: string
}

export default function Button({text, func, color}: Props) {
    return (
        <button onClick={func} className={color + " hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"}>{text}</button>
    )
}