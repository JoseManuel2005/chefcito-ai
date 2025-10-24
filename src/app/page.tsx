import { redirect } from "next/navigation";
import LoginPage from "./login/page";

export default function RootRedirect() {
   redirect("/login");
}
