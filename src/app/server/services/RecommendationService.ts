import { AI } from "@/app/firebase";
import ActiveJob from "@/app/interfaces/ActiveJob.interface";
import ActiveUser from "@/app/interfaces/ActiveUser.interface";

async function recommendJob(user: ActiveUser, potentials: ActiveJob[]): Promise<ActiveJob[]> {
    let prompt = "Choose some potential jobs from the list I give you that you might recommend for this user please! Pleasure return only the jobIDs (max 5) separated by a ';;;;;'\n\nJobs:\n\n";

    for (let p of potentials) {
        prompt += JSON.stringify(p) + "\n";
    }

    prompt += "\n\nUser:\n\n" + JSON.stringify(user);

    const { response } = await AI.generateContent(prompt);

    const ids = response.text().split(";;;;;");
    const jobs: ActiveJob[] = potentials.filter(v => ids.some(id => id == v.jobId));

    return jobs;
}

export { recommendJob };