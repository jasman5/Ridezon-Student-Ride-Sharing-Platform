import { projectConfig } from "@/lib/config";
import { redirect } from "next/navigation";

export async function GET() {
	redirect(projectConfig.projectSrc);
}
