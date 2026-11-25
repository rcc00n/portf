import { Navigate, useLocation } from "react-router-dom";
import { migrationDestination } from "./routeMigration.js";
export default function LegacyRedirect(){const {pathname,search,hash}=useLocation();const target=migrationDestination(pathname.replace(/\/+$/, ""),search,hash);return <Navigate replace to={target || "/404"}/>;}
