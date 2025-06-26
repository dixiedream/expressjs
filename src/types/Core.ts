import { tags } from "typia"

export type Email = string & tags.Format<"email">
export type Password = string & tags.Pattern<"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$">
