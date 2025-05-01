async function generateRoadmap() {
    const careerGoal = document.getElementById("careerInput").value.trim();
    const experienceLevel = document.getElementById("experienceInput").value;
    const preferredLanguage = document.getElementById("languageInput").value;

    if (!careerGoal || !experienceLevel || !preferredLanguage) {
        alert("Please fill out all fields!");
        return;
    }

    document.getElementById("roadmapContainer").innerHTML = "";
    document.getElementById("progressContainer").classList.remove("hidden");
    document.getElementById("progressBar").style.width = "0%";
    document.getElementById("loadingSpinner").classList.remove("hidden");

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                role: careerGoal,
                experience: experienceLevel,
                language: preferredLanguage
            }),
        });

        if (!response.ok) {
            throw new Error(Server error: ${response.status});
        }

        const data = await response.json();
        displayRoadmap(data.roadmap);
    } catch (error) {
        alert("Error generating roadmap: " + error.message);
        console.error(error);
    } finally {
        document.getElementById("loadingSpinner").classList.add("hidden");
    }
}

function displayRoadmap(text) {
    const container = document.getElementById("roadmapContainer");
    container.innerHTML = "";

    // 1. Match all steps using a regex:
    const stepRegex = /\\*Step\s\d+:.?(?=(\*\*Step\s\d+:|$))/gs;
    const steps = [...text.matchAll(stepRegex)];

    if (steps.length === 0) {
        container.innerHTML = "<p class='text-red-500'>Sorry, no steps found! Please try again with a different career goal.</p>";
        return;
    }

    let totalSteps = steps.length;
    let completedSteps = 0;
    document.getElementById("progressContainer").classList.remove("hidden");

    steps.forEach((match, index) => {
        //  Clean and trim the step content
        let step = match[0].trim().replace(/\\/g, '').trim();
        if (!step) return;

        const card = document.createElement("div");
        card.className = "bg-white p-6 rounded-2xl shadow-xl flex items-start gap-6 animate-fade-in border border-indigo-200 mb-6";

        const badge = document.createElement("div");
        badge.className = "flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-lg";
        badge.innerText = index + 1;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "mt-1 w-6 h-6 text-indigo-500 rounded focus:ring-indigo-400 focus:ring-2";
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                completedSteps++;
            } else {
                completedSteps--;
            }
            updateProgress(completedSteps, totalSteps);
        });

        const textDiv = document.createElement("div");
        textDiv.innerHTML = step;
        textDiv.className = "text-gray-800 leading-relaxed step-text"; /* Apply new class  */

        const leftPart = document.createElement("div");
        leftPart.className = "flex flex-col items-center gap-3";
        leftPart.appendChild(badge);
        leftPart.appendChild(checkbox);

        const rightPart = document.createElement("div");
        rightPart.className = "flex-1";
        rightPart.appendChild(textDiv);

        card.appendChild(leftPart);
        card.appendChild(rightPart);
        container.appendChild(card);
    });

    document.getElementById("progressBar").style.width = "100%";
}

function updateProgress(completed, total) {
    const percent = (completed / total) * 100;
    document.getElementById("progressBar").style.width = percent + "%";
}

function downloadPDF() {
    const roadmapContainer = document.getElementById("roadmapContainer");
    if (!roadmapContainer.innerHTML.trim()) {
        alert("No roadmap generated to download!");
        return;
    }

    const opt = {
        margin: 0.5,
        filename: 'career_roadmap.pdf',
        image: {
            type: 'jpeg',
            quality: 0.98
        },
        html2canvas: {
            scale: 2
        },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait'
        }
    };

    html2pdf().from(roadmapContainer).set(opt).save();
}