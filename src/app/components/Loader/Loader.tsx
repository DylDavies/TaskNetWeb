import { PropagateLoader } from "react-spinners";

interface Props {
    loading: boolean;
}

const Loader = ({loading}: Props) => {
    return (
    <section style={{display: loading ? "block" : "none", position: "fixed", width: "100%", height: "100%", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 2}}>
        <p style={{position: "absolute", top: "50%", left: "50%", fontSize: "50px", transform: "translate(-50%, -50%)"}}><PropagateLoader color="#ffffff" /></p>
      </section>
    )
}

export default Loader;