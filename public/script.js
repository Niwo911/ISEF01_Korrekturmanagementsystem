// Logout-Button Funktionalität
document.getElementById('logout')?.addEventListener('click', () => {
    window.location.href = '/login.html';
});

// Studentenseite
const newTicketBtn = document.getElementById('newTicketBtn');
const viewTicketsBtn = document.getElementById('viewTicketsBtn');
const ticketCreationSection = document.getElementById('ticketCreation');
const viewTicketsSection = document.getElementById('viewTickets');

if (newTicketBtn && viewTicketsBtn && ticketCreationSection && viewTicketsSection) {
    newTicketBtn.addEventListener('click', () => {
        ticketCreationSection.style.display = 'block';
        viewTicketsSection.style.display = 'none';
    });

    viewTicketsBtn.addEventListener('click', () => {
        ticketCreationSection.style.display = 'none';
        viewTicketsSection.style.display = 'block';
        loadStudentTickets();
    });

    async function loadStudentTickets() {
        try {
            const response = await fetch('/api/mytickets');
            if (!response.ok) throw new Error("Fehler beim Abrufen der Tickets");
            const tickets = await response.json();
            const ticketList = document.getElementById('ticketList');
            ticketList.innerHTML = '';

            if (tickets.length === 0) {
                ticketList.innerHTML = '<li>Keine Tickets gefunden.</li>';
            } else {
                tickets.forEach(ticket => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <strong>${ticket.title}</strong>: ${ticket.status}
                        <div>
                            <h3>Kommentare des Agenten:</h3>
                            <ul>
                                ${ticket.comments.map(comment => `<li>${comment.comment} - ${new Intl.DateTimeFormat('de-DE').format(new Date(comment.date))}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <p><strong>KursID:</strong> ${ticket.kursID}</p>
                            <p><strong>Medienart:</strong> ${ticket.mediaType}</p>
                            <p><strong>Datum:</strong> ${new Intl.DateTimeFormat('de-DE').format(new Date(ticket.date))}</p>
                            <p><strong>Beschreibung:</strong> ${ticket.description}</p>
                            <p><strong>Genaue Stelle:</strong> ${ticket.exactLocation}</p>
                            <p><strong>Priorität:</strong> ${ticket.priority}</p>
                            <p><strong>E-Mail:</strong> ${ticket.email}</p>
                        </div>
                    `;
                    ticketList.appendChild(li);
                });
            }
        } catch (err) {
            console.error('Fehler beim Abrufen der Tickets:', err);
            document.getElementById('ticketList').innerHTML = `<li>Fehler: ${err.message}</li>`;
        }
    }

    const submitTicketForm = document.getElementById('submitTicketForm');
    if (submitTicketForm) {
        submitTicketForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const ticketData = {
                kursID: document.getElementById('kursID').value,
                title: document.getElementById('title').value,
                mediaType: document.getElementById('mediaType').value,
                date: document.getElementById('date').value,
                description: document.getElementById('description').value,
                exactLocation: document.getElementById('exactLocation').value,
                priority: document.getElementById('priority').value,
                name: document.getElementById('name').value,
                course: document.getElementById('course').value,
                matriculation: document.getElementById('matriculation').value,
                email: document.getElementById('email').value
            };

            try {
                const response = await fetch('/api/tickets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ticketData)
                });

                if (!response.ok) throw new Error('Fehler beim Erstellen des Tickets');

                await response.json();
                alert('Ticket wurde erfolgreich erstellt!');
                submitTicketForm.reset();
                document.getElementById('date').value = new Date().toISOString().split('T')[0];
            } catch (err) {
                alert('Fehler beim Erstellen des Tickets: ' + err.message);
            }
        });
    }
}

// Agentenseite
const viewTicketsBtnAgent = document.getElementById('viewTicketsBtn');
const ticketManagementSection = document.getElementById('ticketManagement');

if (viewTicketsBtnAgent && ticketManagementSection) {
    viewTicketsBtnAgent.addEventListener('click', () => {
        ticketManagementSection.style.display = 'block';
        loadAgentTickets();
    });

    document.getElementById('applyFilters')?.addEventListener('click', loadAgentTickets);

    async function loadAgentTickets() {
        const search = document.getElementById('searchTickets')?.value || '';
        const status = document.getElementById('filterStatus')?.value || '';

        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (status) queryParams.append('status', status);

        try {
            const response = await fetch(`/api/tickets?${queryParams.toString()}`);
            if (!response.ok) throw new Error('Fehler beim Abrufen der Tickets');
            const tickets = await response.json();
            const ticketList = document.getElementById('ticketList');
            ticketList.innerHTML = '';

            if (tickets.length === 0) {
                ticketList.innerHTML = '<li>Keine Tickets gefunden.</li>';
            } else {
                tickets.forEach(ticket => {
                    const formattedDate = new Intl.DateTimeFormat('de-DE').format(new Date(ticket.date));

                    const li = document.createElement('li');
                    li.innerHTML = `
                        <strong>${ticket.title}</strong> - Status: ${ticket.status}
                        <div>
                            <textarea id="comment_${ticket._id}" placeholder="Kommentar hinzufügen..."></textarea>
                            <label for="status_${ticket._id}">Status ändern:</label>
                            <select id="status_${ticket._id}" ${ticket.status === 'abgeschlossen' ? 'disabled' : ''}>
                                <option value="in Bearbeitung" ${ticket.status === 'in Bearbeitung' ? 'selected' : ''}>In Bearbeitung</option>
                                <option value="abgeschlossen" ${ticket.status === 'abgeschlossen' ? 'selected' : ''}>Abgeschlossen</option>
                            </select>
                            <div class="action-buttons-container">
                                <button class="action-button" onclick="updateTicket('${ticket._id}')">Aktualisieren</button>
                                <button class="action-button" onclick="deleteTicket('${ticket._id}')">Löschen</button>
                                <button class="action-button" onclick="toggleDetails('${ticket._id}')">Details anzeigen</button>
                            </div>
                            <div id="details_${ticket._id}" style="display: none;">
                                <p><strong>KursID:</strong> ${ticket.kursID}</p>
                                <p><strong>Medienart:</strong> ${ticket.mediaType}</p>
                                <p><strong>Datum:</strong> ${formattedDate}</p>
                                <p><strong>Beschreibung:</strong> ${ticket.description}</p>
                                <p><strong>Genaue Stelle:</strong> ${ticket.exactLocation}</p>
                                <p><strong>Priorität:</strong> ${ticket.priority}</p>
                                <p><strong>Name:</strong> ${ticket.name}</p>
                                <p><strong>Studiengang:</strong> ${ticket.course}</p>
                                <p><strong>Matrikelnummer:</strong> ${ticket.matriculation}</p>
                                <p><strong>E-Mail des Studenten:</strong> ${ticket.email || 'Keine E-Mail angegeben'}</p>
                            </div>
                            <h3>Kommentare</h3>
                            <ul id="commentHistory_${ticket._id}">
                                ${ticket.comments.map(comment => `<li>${comment.comment} - ${new Date(comment.date).toLocaleString('de-DE')}</li>`).join('')}
                            </ul>
                        </div>`;
                    ticketList.appendChild(li);
                });
            }
        } catch (err) {
            console.error('Fehler beim Abrufen der Tickets:', err);
            document.getElementById('ticketList').innerHTML = `<li>Fehler: ${err.message}</li>`;
        }
    }

    window.toggleDetails = function(ticketId) {
        const detailsSection = document.getElementById(`details_${ticketId}`);
        detailsSection.style.display = detailsSection.style.display === 'none' ? 'block' : 'none';
    };

    window.updateTicket = async function(ticketId) {
        const comment = document.getElementById(`comment_${ticketId}`).value;
        const status = document.getElementById(`status_${ticketId}`).value;

        try {
            const response = await fetch(`/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment, status })
            });

            if (!response.ok) throw new Error('Fehler beim Aktualisieren des Tickets');

            const ticket = await response.json();
            const commentHistory = document.getElementById(`commentHistory_${ticket._id}`);
            commentHistory.innerHTML = ticket.comments.map(c => `<li>${c.comment} - ${new Date(c.date).toLocaleString('de-DE')}</li>`).join('');

            const statusSelect = document.getElementById(`status_${ticket._id}`);
            if (ticket.status === 'abgeschlossen') {
                statusSelect.disabled = true;
            }

            alert('Ticket erfolgreich aktualisiert!');
        } catch (err) {
            alert('Fehler beim Aktualisieren des Tickets: ' + err.message);
        }
    };

    window.deleteTicket = async function(ticketId) {
        try {
            const response = await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' });

            if (!response.ok) throw new Error('Fehler beim Löschen des Tickets');

            await response.json();
            alert('Ticket erfolgreich gelöscht');
            loadAgentTickets();
        } catch (err) {
            alert('Fehler beim Löschen des Tickets: ' + err.message);
        }
    };
}