import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, CheckCircle, XCircle, Code, List, Users, MessageCircle, FileText } from 'lucide-react';
import Chat from '../components/Chat';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', technology: '', description: '' });
  
  // Chat state
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatName, setActiveChatName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, reqRes] = await Promise.all([
        axios.get('http://localhost:5000/api/projects/teacher'),
        axios.get('http://localhost:5000/api/requests/teacher')
      ]);
      setProjects(projRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/projects', newProject);
      setNewProject({ title: '', technology: '', description: '' });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequest = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/requests/${id}/status`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openChat = (projectId, groupName) => {
    setActiveChatId(`project_${projectId}`);
    setActiveChatName(`Group (Project: ${groupName})`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Teacher Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your projects, requests, and submissions</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md"
        >
          <PlusCircle className="w-5 h-5" />
          Add Project
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel p-6 mb-8 border-l-4 border-l-indigo-500 animate-fade-in">
          <h2 className="text-xl font-bold mb-4">Post a New Project</h2>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
                <input type="text" required value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Technology</label>
                <input type="text" required placeholder="React, Node, Python..." value={newProject.technology} onChange={e => setNewProject({...newProject, technology: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea required rows="3" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Project</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projects List (Allocated and Open) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
          <div className="bg-slate-50 px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-lg">My Projects Dashboard</h2>
            </div>
            <span className="bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-xs font-bold">{projects.length}</span>
          </div>
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {projects.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No projects added yet.</p>
            ) : (
              projects.map(proj => {
                const isAllocated = proj.status === 'allocated' || proj.status === 'completed';
                return (
                  <div key={proj.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${isAllocated ? 'border-indigo-200 bg-indigo-50/20' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-lg">{proj.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${isAllocated ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                        {proj.status.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* If allocated, show extra management tools */}
                    {isAllocated && (
                      <div className="mt-4 pt-4 border-t border-indigo-100 space-y-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openChat(proj.id, proj.title)}
                            className="text-xs bg-white border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-indigo-50 font-medium"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Group Chat
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-white p-2 rounded border border-slate-100 shadow-sm">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Synopsis</p>
                            {proj.synopsisUrl ? (
                              <a href={proj.synopsisUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 truncate"><FileText className="w-3 h-3"/> View File</a>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Not submitted</span>
                            )}
                          </div>
                          <div className="bg-white p-2 rounded border border-slate-100 shadow-sm">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Final Project</p>
                            {proj.finalUrl ? (
                              <a href={proj.finalUrl} target="_blank" rel="noreferrer" className="text-xs text-teal-600 hover:underline flex items-center gap-1 truncate"><Code className="w-3 h-3"/> View Code</a>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Not submitted</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
          <div className="bg-slate-50 px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <h2 className="font-semibold text-lg">Incoming Requests</h2>
            </div>
            <span className="bg-teal-100 text-teal-700 py-0.5 px-2 rounded-full text-xs font-bold">{requests.filter(r => r.status === 'pending').length} Pending</span>
          </div>
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {requests.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No requests received yet.</p>
            ) : (
              requests.map(req => (
                <div key={req.id} className={`border rounded-lg p-4 ${req.status === 'pending' ? 'border-teal-200 bg-teal-50/30' : ''}`}>
                  <div className="mb-3">
                    <p className="text-sm font-medium text-slate-500">Requested Project:</p>
                    <p className="font-bold text-slate-800">{req.project?.title}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-500 mb-1">Group Members:</p>
                    <div className="text-sm space-y-1">
                      {req.group?.members.map((m, i) => (
                        <div key={i} className="flex justify-between bg-white p-2 rounded border border-slate-100 shadow-sm">
                          <span className="font-medium text-slate-700">{m.name}</span>
                          <span className="text-slate-500 text-xs">Roll: {m.rollNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {req.status === 'pending' ? (
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => handleRequest(req.id, 'accepted')} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded flex items-center justify-center gap-1 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Accept
                      </button>
                      <button onClick={() => handleRequest(req.id, 'rejected')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded flex items-center justify-center gap-1 transition-colors">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  ) : (
                    <div className={`text-center py-2 rounded font-medium text-sm mt-4 ${req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {req.status === 'accepted' ? 'Request Accepted' : 'Request Rejected'}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {activeChatId && (
        <Chat 
          roomId={activeChatId}
          currentUser={user}
          otherPartyName={activeChatName}
          onClose={() => setActiveChatId(null)}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
