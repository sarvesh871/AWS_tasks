// =======================
// CONFIGURATION
// =======================

const API_URL = "https://nt5jhn1tw0.execute-api.ap-south-1.amazonaws.com/prod_updated/note";

const filenameInput = document.getElementById("filename");
const contentInput = document.getElementById("content");

const notesList = document.getElementById("notesList");

const previewFilename = document.getElementById("previewFilename");
const previewContent = document.getElementById("previewContent");

const toast = document.getElementById("toast");


// =======================
// TOAST
// =======================

function showToast(message, success = true){

    toast.innerText = message;

    toast.style.background =
        success ? "#16a34a" : "#dc2626";

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    },2500);

}


// =======================
// LOAD NOTES
// =======================

async function loadNotes(){

    try{

        const response = await fetch(API_URL);

        const data = await response.json();

        notesList.innerHTML = "";

        if(!data.files || data.files.length===0){

            notesList.innerHTML =
                "<p>No notes found.</p>";

            return;

        }

        data.files.forEach(file=>{

            const card = document.createElement("div");

            card.className = "note-card";

            card.innerHTML = `

                <div class="note-title">
                    📄 ${file}
                </div>

                <div class="note-actions">

                    <button
                        class="view"
                        onclick="viewNote('${file}')">

                        👁 View

                    </button>

                    <button
                        class="edit"
                        onclick="editNote('${file}')">

                        ✏ Edit

                    </button>

                    <button
                        class="delete"
                        onclick="deleteNote('${file}')">

                        🗑 Delete

                    </button>

                </div>

            `;

            notesList.appendChild(card);

        });

    }

    catch(error){

        console.error(error);

        showToast("Unable to load notes.",false);

    }

}


// =======================
// VIEW NOTE
// =======================

async function viewNote(filename){

    try{

        const response =
        await fetch(
            `${API_URL}?filename=${encodeURIComponent(filename)}`
        );

        const data = await response.json();

        previewFilename.innerText =
            data.filename;

        previewContent.innerText =
            data.content;

    }

    catch(error){

        console.error(error);

        showToast("Unable to read note.",false);

    }

}


// =======================
// EDIT NOTE
// =======================

async function editNote(filename){

    try{

        const response =
        await fetch(
            `${API_URL}?filename=${encodeURIComponent(filename)}`
        );

        const data = await response.json();

        filenameInput.value =
            data.filename;

        contentInput.value =
            data.content;

        previewFilename.innerText =
            data.filename;

        previewContent.innerText =
            data.content;

    }

    catch(error){

        console.error(error);

    }

}


// =======================
// SAVE
// =======================

document
.getElementById("saveBtn")
.addEventListener("click",async()=>{

    const filename =
        filenameInput.value.trim();

    const content =
        contentInput.value.trim();

    if(!filename || !content){

        showToast(
            "Filename and content required.",
            false
        );

        return;

    }

    try{

        await fetch(API_URL,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                filename,

                content

            })

        });

        showToast("Note Saved");

        loadNotes();

    }

    catch(error){

        console.error(error);

        showToast("Unable to save.",false);

    }

});


// =======================
// UPDATE
// =======================

document
.getElementById("updateBtn")
.addEventListener("click",async()=>{

    const filename =
        filenameInput.value.trim();

    const content =
        contentInput.value.trim();

    if(!filename || !content){

        showToast(
            "Filename and content required.",
            false
        );

        return;

    }

    try{

        await fetch(API_URL,{

            method:"PUT",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                filename,

                content

            })

        });

        showToast("Note Updated");

        loadNotes();

    }

    catch(error){

        console.error(error);

        showToast("Unable to update.",false);

    }

});


// =======================
// DELETE
// =======================

async function deleteNote(filename){

    if(
        !confirm(
            `Delete ${filename}?`
        )
    ) return;

    try{

        await fetch(

            `${API_URL}?filename=${encodeURIComponent(filename)}`,

            {

                method:"DELETE"

            }

        );

        showToast("Note Deleted");

        previewFilename.innerText =
            "No Note Selected";

        previewContent.innerText =
            "Select a note to view it here.";

        loadNotes();

    }

    catch(error){

        console.error(error);

        showToast("Delete failed.",false);

    }

}


// =======================
// CLEAR
// =======================

document
.getElementById("clearBtn")
.addEventListener("click",()=>{

    filenameInput.value="";

    contentInput.value="";

});


// =======================
// REFRESH
// =======================

document
.getElementById("refreshBtn")
.addEventListener("click",loadNotes);


// =======================
// START
// =======================

loadNotes();