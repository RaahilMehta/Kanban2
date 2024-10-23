import React, { useState, useEffect } from 'react';

// Icons as Components
const Icons = {
	Circle: () => <div className="icon-circle" />,
	Plus: () => <div className="icon-plus">+</div>,
	Ellipsis: () => <div className="icon-ellipsis">•••</div>,
	ChevronDown: () => <div className="icon-chevron-down">▼</div>,
	Signal: () => <div className="icon-signal">📶</div>,
	Done: () => <div className="icon-done">✓</div>,
	Progress: () => <div className="icon-progress">⟳</div>,
	Cancel: () => <div className="icon-cancel">✕</div>
};

// Constants
const PRIORITY_LABELS = {
	4: { label: 'Urgent', icon: '🔴' },
	3: { label: 'High', icon: '🔺' },
	2: { label: 'Medium', icon: '🔷' },
	1: { label: 'Low', icon: '🔹' },
	0: { label: 'No priority', icon: '◽' }
};

const STATUS_ICONS = {
	'Todo': <Icons.Circle />,
	'In Progress': <Icons.Progress />,
	'Done': <Icons.Done />,
	'Cancelled': <Icons.Cancel />
};

// Main App Component
const App = () => {
	const [tickets, setTickets] = useState([]);
	const [users, setUsers] = useState([]);
	const [displaySettings, setDisplaySettings] = useState(() => {
		const saved = localStorage.getItem('displaySettings');
		return saved ? JSON.parse(saved) : { groupBy: 'status', sortBy: 'priority' };
	});
	const [showDisplayMenu, setShowDisplayMenu] = useState(false);

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		localStorage.setItem('displaySettings', JSON.stringify(displaySettings));
	}, [displaySettings]);

	const fetchData = async () => {
		try {
			const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
			const data = await response.json();
			setTickets(data.tickets);
			setUsers(data.users);
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	const groupTickets = (tickets) => {
		switch (displaySettings.groupBy) {
			case 'status':
				return groupByStatus(tickets);
			case 'user':
				return groupByUser(tickets);
			case 'priority':
				return groupByPriority(tickets);
			default:
				return {};
		}
	};

	const sortTickets = (tickets) => {
		return [...tickets].sort((a, b) => {
			if (displaySettings.sortBy === 'priority') {
				return b.priority - a.priority;
			}
			return a.title.localeCompare(b.title);
		});
	};

	const groupByStatus = (tickets) => {
		const groups = {};
		tickets.forEach(ticket => {
			if (!groups[ticket.status]) {
				groups[ticket.status] = [];
			}
			groups[ticket.status].push(ticket);
		});
		return groups;
	};

	const groupByUser = (tickets) => {
		const groups = {};
		tickets.forEach(ticket => {
			const user = users.find(u => u.id === ticket.userId);
			const userName = user ? user.name : 'Unassigned';
			if (!groups[userName]) {
				groups[userName] = [];
			}
			groups[userName].push(ticket);
		});
		return groups;
	};

	const groupByPriority = (tickets) => {
		const groups = {};
		Object.entries(PRIORITY_LABELS).forEach(([priority, { label }]) => {
			groups[label] = tickets.filter(t => t.priority === parseInt(priority));
		});
		return groups;
	};

	const groupedTickets = groupTickets(tickets);
	Object.keys(groupedTickets).forEach(key => {
		groupedTickets[key] = sortTickets(groupedTickets[key]);
	});

	return (
		<div className="app">
			{/* Header */}
			<header className="header">
				<div className="display-button-container">
					<button
						onClick={() => setShowDisplayMenu(!showDisplayMenu)}
						className="display-button"
					>
						<span>Display</span>
						<Icons.ChevronDown />
					</button>

					{showDisplayMenu && (
						<div className="display-menu">
							<div className="menu-item">
								<span>Grouping</span>
								<select
									value={displaySettings.groupBy}
									onChange={(e) => setDisplaySettings(prev => ({ ...prev, groupBy: e.target.value }))}
								>
									<option value="status">Status</option>
									<option value="user">User</option>
									<option value="priority">Priority</option>
								</select>
							</div>
							<div className="menu-item">
								<span>Ordering</span>
								<select
									value={displaySettings.sortBy}
									onChange={(e) => setDisplaySettings(prev => ({ ...prev, sortBy: e.target.value }))}
								>
									<option value="priority">Priority</option>
									<option value="title">Title</option>
								</select>
							</div>
						</div>
					)}
				</div>
			</header>

			{/* Board */}
			<div className="board">
				{Object.entries(groupedTickets).map(([groupName, groupTickets]) => (
					<div key={groupName} className="column">
						<div className="column-header">
							<div className="group-info">
								{STATUS_ICONS[groupName] || PRIORITY_LABELS[groupName]?.icon || '👤'}
								<span className="group-name">{groupName}</span>
								<span className="ticket-count">{groupTickets.length}</span>
							</div>
							<div className="column-actions">
								<Icons.Plus />
								<Icons.Ellipsis />
							</div>
						</div>

						<div className="tickets">
							{groupTickets.map(ticket => (
								<div key={ticket.id} className="ticket">
									<div className="ticket-header">
										<span className="ticket-id">{ticket.id}</span>
										<div className="user-avatar">
											{users.find(u => u.id === ticket.userId)?.name.charAt(0)}
										</div>
									</div>
									<div className="ticket-title">
										{STATUS_ICONS[ticket.status]}
										<p>{ticket.title}</p>
									</div>
									<div className="ticket-tags">
										<div className="priority-indicator">
											{PRIORITY_LABELS[ticket.priority].icon}
										</div>
										<div className="tag">
											{ticket.tag.join(', ')}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			<style jsx>{`
        .app {
          min-height: 100vh;
          background-color: #f4f5f8;
        }

        .header {
          background-color: white;
          padding: 16px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .display-button-container {
          position: relative;
          display: inline-block;
        }

        .display-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }

        .display-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 8px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 16px;
          width: 240px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        .menu-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .menu-item select {
          padding: 4px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }

        .board {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          padding: 16px;
        }

        .column {
          background-color: #f4f5f8;
          border-radius: 8px;
          padding: 16px;
        }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .group-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .column-actions {
          display: flex;
          gap: 8px;
        }

        .tickets {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ticket {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .ticket-id {
          color: #6b6b6b;
          font-size: 14px;
        }

        .user-avatar {
          width: 24px;
          height: 24px;
          background: #e0e0e0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .ticket-title {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .ticket-tags {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .tag {
          padding: 2px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 12px;
          color: #6b6b6b;
        }

        .icon-circle {
          width: 16px;
          height: 16px;
          border: 2px solid #6b6b6b;
          border-radius: 50%;
        }

        .icon-plus {
          font-size: 18px;
          color: #6b6b6b;
          cursor: pointer;
        }

        .icon-ellipsis {
          color: #6b6b6b;
          cursor: pointer;
          letter-spacing: 1px;
        }

        .icon-chevron-down {
          font-size: 10px;
          color: #6b6b6b;
        }

        .icon-progress {
          color: #0052cc;
        }

        .icon-done {
          color: #00875a;
        }

        .icon-cancel {
          color: #e11d48;
        }

        @media (max-width: 768px) {
          .board {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
		</div>
	);
};

export default App;