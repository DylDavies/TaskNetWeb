import Link from "next/link";

export default function Page(){
    return(
        <>
            <h1>This is the freelancer page</h1>
            <nav>
                <Link href="/freelancer">link to freelancer</Link> {" "}
                <br></br>
                <Link href="/">link to Home</Link> {" "}
                <br></br>
                <Link href="/client">link to client</Link> {" "}
                <br></br>
                <Link href="/admin">link to admin</Link> {" "}
            </nav>
        
        </>
    )
}