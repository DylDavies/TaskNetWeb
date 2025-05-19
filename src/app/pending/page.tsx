import PendingCard from "../components/PendingCard/PendingCard";

/*This is a pending card that will pop up when an admin hasd not yet approved ir denied  a users account*/

export default function Page(){
    return(
        <>
            <section className="flex items-center justify-center min-h-screen bg-[#27274b]">
                <PendingCard/>
            </section>
        </>
    );
}