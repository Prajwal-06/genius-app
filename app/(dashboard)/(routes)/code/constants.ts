import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export const formSchema = z.object({
    promt: z.string().min(1 , {
        message: "Prompt is required",
    }),
});