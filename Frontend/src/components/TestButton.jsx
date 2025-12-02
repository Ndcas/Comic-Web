import { Link } from "react-router";

export default function TestButton(props) {
    return (
        <Link to={props.to}>Go to {props.label}</Link>
    );
}