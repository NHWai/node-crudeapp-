"use strict";

const main = document.querySelector(".main");
const usrName = document.querySelector("#usrName");
const usrEmail = document.querySelector("#usrEmail");
const usrPwd = document.querySelector("#usrPwd");
const usrEdit = document.querySelector(".usrEdit");
const usrId = document.querySelector("#usrId");
const formSubmit = document.querySelector(".formSubmit");
const formEl = document.querySelector(".formEl");
const usersList = document.querySelector(".usersList");

const uploadImgForm = document.querySelector(".uploadImgForm");
const uploadBtn = document.querySelector(".uploadBtn");
const fileEl = document.querySelector("#file");
let closeElArr;
let editElArr;
let cardElArr;

const getUsrs = async function () {
  const res = await fetch("http://localhost:3000/users");
  const data = await res.json();
  renderUsers(data);
  return;
};

const getSpecificUsr = async function (id) {
  const res = await fetch(`http://localhost:3000/users/${id}`);
  const data = await res.json();
  // renderUsers(data);
  console.log(data);
  return;
};

const renderUsers = function (usrs) {
  let innerEl = "";
  for (const el of usrs) {
    innerEl += `
    <div class='cardEl'>
      <div
        style="
                display: flex;
                justify-content: flex-end;
                padding-top: 0.2rem;
              "
      >
        <div class='editCard'>
            <ion-icon
            style="color: green; cursor: pointer; margin-right: 0.2rem"
            name="create-outline"></ion-icon>
        </div>
        <div data-doc=${usrs.indexOf(el)} class='closeCard'>   
            <ion-icon
            class='close'
              style="color: red; cursor: pointer"
              name="close-outline"
            ></ion-icon>
        </div>
      </div>
      <div><span> Name : </span> <span style='margin-left:0.3rem'>${
        el.fName
      } </span></div>
      <div> <span>Email : </span>  <span style='margin-left:0.3rem' >${
        el.email
      }</span></div>
      <div> <span>Password : </span> <span style='margin-left:0.3rem'>${
        el.pwd
      }</span></div>
      <div style='display:none;' >${el.isEdit}</div>
    </div>
    `;
  }

  usersList.innerHTML = innerEl;

  cardElArr = [...document.querySelectorAll(".cardEl")];
  closeElArr = [...document.querySelectorAll(".closeCard")];
  editElArr = [...document.querySelectorAll(".editCard")];

  //listening delete events
  for (const card of closeElArr) {
    card.addEventListener("click", () => delCard(card.dataset.doc));
  }

  //listening edit events
  for (let i = 0; i < editElArr.length; i++) {
    editElArr[i].addEventListener("click", async () => {
      const res = await fetch(`http://localhost:3000/user-${i}`);
      const data = await res.json();

      cardElArr[i].style = "display:none;";

      const currCard = {
        fName: data.fName,
        email: data.email,
        pwd: data.pwd,
      };
      editCard(i, currCard);
    });
  }

  return;
};

const handleForm = function () {
  formEl.addEventListener("submit", async (e) => {
    try {
      e.preventDefault();
      const user = {
        fName: usrName.value,
        email: usrEmail.value,
        pwd: usrPwd.value,
      };
      const id = usrId.textContent;
      formEl.reset();
      usrId.textContent = "";

      if (id.length === 0) {
        //create new card
        const res = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(user),
        });
        const data = await res.json();
        renderUsers(data);
      } else {
        // edit existing card
        const res = await fetch(`http://localhost:3000/user-${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(user),
        });
        const data = await res.json();
        renderUsers(data);
      }
      return;
    } catch (err) {
      alert("Invalid input");
      getUsrs();
      return;
    }
  });
};

const delCard = async function (id) {
  const res = await fetch(`http://localhost:3000/user-${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  window.location.href = `${data.redirect}`;
  return;
};

const editCard = function (id, card) {
  //
  usrName.value = card.fName;
  usrEmail.value = card.email;
  usrPwd.value = card.pwd;
  usrId.textContent = id;
  return;
};

const postFile = async function (content) {
  console.log("in post file =>", content);
  const res = await fetch("http://localhost:3000/fileupload", {
    method: "POST",
    body: content,
  });
  const data = await res.json();
  console.log("data =>", data);
  return;
};

uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const incomingFile = fileEl.files[0];
  uploadImgForm.reset();
  console.log(incomingFile);
  postFile(incomingFile);
});

getUsrs();
handleForm();
