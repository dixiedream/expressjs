import typia from "typia";
import { LoginDataInput } from "../types/Requests.js";

export const validateLoginData = typia.createAssertGuard<LoginDataInput>()
