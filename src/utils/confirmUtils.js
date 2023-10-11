import Swal from "sweetalert2";

const showConfirmAlert = (message = "", callback) => {
  Swal.fire({
    title: "Alert",
    icon: "info",
    allowOutsideClick: false,
    confirmButtonText: "Yes",
    showCancelButton: "true",
    cancelButtonText: "No",
    cancelButtonColor: "#f82649",
    text: message,
  }).then((result) => {
    if (result.isConfirmed) {
      callback();
    }
  });
};

export { showConfirmAlert };
