const EditSeminarModal = ({ seminar, show, onSave, onClose }) => {
  const [editedSeminar, setEditedSeminar] = useState(seminar);

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
    fetch(`http://localhost:3001/seminars/${editedSeminar.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedSeminar),
    })
      .then((response) => response.json())
      .then((updatedSeminar) => {
        onSave(updatedSeminar);
      })
      .catch((err) => setError(err.message));
  };

  if (!show) return null;

  return (
    <div style={modalStyles}>
      <h3>Редактировать семинар</h3>
      <input
        type="text"
        name="title"
        value={editedSeminar.title}
        onChange={handleChange}
        placeholder="Название семинара"
      />
      <input
        type="date"
        name="date"
        value={editedSeminar.date}
        onChange={handleChange}
      />
      <button onClick={handleSave}>Сохранить</button>
      <button onClick={onClose}>Отмена</button>
    </div>
  );
};

const App = () => {
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [seminarToDelete, setSeminarToDelete] = useState(null);
  const [seminarToEdit, setSeminarToEdit] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/seminars")
      .then((res) => res.json())
      .then((data) => {
        setSeminars(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = (id) => {
    setSeminarToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    fetch(`http://localhost:3001/seminars/${seminarToDelete}`, {
      method: "DELETE",
    })
      .then(() => {
        setSeminars(
          seminars.filter((seminar) => seminar.id !== seminarToDelete)
        );
        setShowDeleteModal(false);
      })
      .catch((err) => {
        setError(err.message);
        setShowDeleteModal(false);
      });
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setShowEditModal(false);
    setSeminarToDelete(null);
    setSeminarToEdit(null);
  };

  const handleEdit = (seminar) => {
    setSeminarToEdit(seminar);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedSeminar) => {
    setSeminars(
      seminars.map((seminar) =>
        seminar.id === updatedSeminar.id ? updatedSeminar : seminar
      )
    );
    closeModal();
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  return (
    <div>
      <h1>Список семинаров</h1>
      <ul>
        {seminars.map((seminar) => (
          <li key={seminar.id}>
            {seminar.title} - {seminar.date}
            <button onClick={() => handleEdit(seminar)}>Редактировать</button>
            <button onClick={() => handleDelete(seminar.id)}>Удалить</button>
          </li>
        ))}
      </ul>

      <ConfirmDeleteModal
        show={showDeleteModal}
        onDelete={confirmDelete}
        onClose={closeModal}
      />

      <EditSeminarModal
        seminar={seminarToEdit}
        show={showEditModal}
        onSave={handleSaveEdit}
        onClose={closeModal}
      />
    </div>
  );
};

export default App;
