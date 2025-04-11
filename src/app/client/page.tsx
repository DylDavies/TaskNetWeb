import Link from "next/link";
import "./client.css";
import "../globals.css";


export default function Page(){
    return(
        <>
            <body className = "client-body">

                <img src="./client/Logo.png" alt="Logo" className="logo"></img>
                <h1>Hello Client</h1>

            <footer className = "client-footer">
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