import React, { useEffect, useState } from "react";
import "./style.css";

const ConfirmDeleteModal = ({ show, onDelete, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3 className="modal-title title-res">
          Вы уверены, что хотите удалить этот семинар?
        </h3>
        <div className="modal-buttons">
          <button className="btn btn-delete-yes btn-reset" onClick={onDelete}>
            Да
          </button>
          <button className="btn btn-cancel btn-reset" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

const EditSeminarModal = ({ seminar, show, onSave, onClose, setError }) => {
  const [editedSeminar, setEditedSeminar] = useState(seminar || {});

  useEffect(() => {
    if (seminar) {
      setEditedSeminar(seminar);
    }
  }, [seminar]);

  const handleChange = (e) => {
    setEditedSeminar({
      ...editedSeminar,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    if (!editedSeminar.id) {
      setError("Отсутствует ID семинара");
      return;
    }

    console.log("Sending PUT request with data:", editedSeminar);

    fetch(`http://localhost:3001/seminars/${editedSeminar.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedSeminar),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ошибка при сохранении семинара на сервере");
        }
        return response.json();
      })
      .then((updatedSeminar) => {
        onSave(updatedSeminar);
        onClose();
      })
      .catch((err) => {
        console.error("Error saving seminar:", err);
        setError(err.message);
      });
  };

  if (!show || !seminar) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3 className="modal-title title-res">Редактировать семинар</h3>
        <input
          type="text"
          name="title"
          value={editedSeminar.title || ""}
          onChange={handleChange}
          placeholder="Название семинара"
          className="modal-input"
        />
        <input
          type="date"
          name="date"
          value={editedSeminar.date || ""}
          onChange={handleChange}
          className="modal-input"
        />
        <div className="modal-buttons">
          <button className="btn btn-save btn-reset" onClick={handleSave}>
            Сохранить
          </button>
          <button className="btn btn-cancel btn-reset" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeminar, setSelectedSeminar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/seminars")
      .then((response) => response.json())
      .then((data) => {
        setSeminars(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Ошибка при загрузке данных семинаров");
        setLoading(false);
      });
  }, []);

  const handleDelete = () => {
    fetch(`http://localhost:3001/seminars/${selectedSeminar.id}`, {
      method: "DELETE",
    })
      .then(() => {
        setSeminars(
          seminars.filter((seminar) => seminar.id !== selectedSeminar.id)
        );
        setShowDeleteModal(false);
        setSelectedSeminar(null);
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="app">
      <h1 className="app-title title-res">Семинары</h1>
      {loading && <p>Загрузка...</p>}
      {error && <p>Ошибка: {error}</p>}

      <ul className="seminar-list list-reset">
        {seminars.map((seminar) => (
          <li key={seminar.id} className="seminar-item">
            <img
              src={seminar.photo}
              alt={seminar.title}
              className="seminar-photo"
            />
            <h2 className="seminar-title title-res">{seminar.title}</h2>
            <p className="seminar-description descr-reset">
              {seminar.description}
            </p>
            <p className="seminar-date descr-reset">{seminar.date}</p>
            <div className="btn-group">
              <button
                className="btn btn-edit btn-reset"
                onClick={() => {
                  setSelectedSeminar(seminar);
                  setShowModal(true);
                }}
              >
                Редактировать
              </button>
              <button
                className="btn btn-delete btn-reset"
                onClick={() => {
                  setSelectedSeminar(seminar);
                  setShowDeleteModal(true);
                }}
              >
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>

      <EditSeminarModal
        seminar={selectedSeminar}
        show={showModal}
        onSave={(updatedSeminar) => {
          setSeminars(
            seminars.map((seminar) =>
              seminar.id === updatedSeminar.id ? updatedSeminar : seminar
            )
          );
          setShowModal(false);
        }}
        onClose={() => setShowModal(false)}
        setError={setError}
      />
      <ConfirmDeleteModal
        show={showDeleteModal}
        onDelete={handleDelete}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default App;
