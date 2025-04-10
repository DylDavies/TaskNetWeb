import Link from "next/link";
import "./client.css";


export default function Page(){
    return(
        <>
            <body>

                <img src="./client/Logo.png" alt="Logo" className="logo"></img>
                <h1>Hello Client</h1>

            <footer>
            <nav>
                <Link href="/freelancer">link to freelancer</Link> {" "}
                <br></br>
                <Link href="/">link to Home</Link> {" "}
                <br></br>
                <Link href="/client">link to client</Link> {" "}
                <br></br>
                <Link href="/admin">link to admin</Link> {" "}
            </nav>
            </footer>

            </body>
        </>
    )
}