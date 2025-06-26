import typia from "typia";
import { LoginDataInput } from "../types/Requests";

export const validateLoginData = typia.createAssertGuard<LoginDataInput>()
