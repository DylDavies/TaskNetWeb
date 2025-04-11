import Link from "next/link";
import "./freelancer.css";
import "../global.css";

export default function Page(){
    return(
        <>
            <body className ="freelancer-body">

                <img src="/images/Logo.png" alt="Logo" className="logo"></img>
                <h1>Hello freelancer</h1>

            <footer className = "freelancer-footer">
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
    );
}