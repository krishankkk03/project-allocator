import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, Search, Code, CheckCircle, Clock, Send, FileText, MessageCircle, UploadCloud, AlertCircle } from 'lucide-react';
import Chat from '../components/Chat';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Chat state
  const [showChat, setShowChat] = useState(false);

  // Submission state
  const [synopsisUrl, setSynopsisUrl] = useState('');
  const [finalUrl, setFinalUrl] = useState('');

  // Group creation state
  const [numAdditionalMembers, setNumAdditionalMembers] = useState(0);
  const [memberEmails, setMemberEmails] = useState(['', '', '']);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupRes, projRes, reqRes] = await Promise.all([
        axios.get('http://localhost:5000/api/groups/me'),
        axios.get('http://localhost:5000/api/projects'),
        axios.get('http://localhost:5000/api/requests/student')
      ]);
      setGroup(groupRes.data);
      setProjects(projRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...memberEmails];
    newEmails[index] = value;
    setMemberEmails(newEmails);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const emailsToLink = memberEmails.slice(0, numAdditionalMembers).filter(e => e.trim() !== '');
    try {
      const res = await axios.post('http://localhost:5000/api/groups', { additionalEmails: emailsToLink });
      setGroup(res.data);
      alert('Group created successfully! All members are now linked.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create group');
    }
  };

  const handleRequestProject = async (projectId) => {
    if (!group) {
      alert('You must create a group first!');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/requests', { projectId, groupId: group.id });
      alert('Request sent successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send request');
    }
  };

  const handleSubmitSynopsis = async (e, projectId) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/projects/${projectId}/submit-synopsis`, { synopsisUrl });
      alert('Synopsis submitted successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit synopsis');
    }
  };

  const handleSubmitFinal = async (e, projectId) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/projects/${projectId}/submit-final`, { finalUrl });
      alert('Final Project submitted successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit final project');
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;

  const allocatedRequest = requests.find(r => r.status === 'accepted');

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Student Dashboard</h1>
        <p className="text-slate-500 mt-1">Find projects and manage your team</p>
      </div>

      {!group ? (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> Setup Your Team</h2>
            <p className="opacity-90 mt-1 text-sm">You can work Solo or invite up to 3 registered friends to join your group.</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">Member 1 (You - Leader)</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                  <p>Name: <span className="font-medium text-slate-800">{user.name}</span></p>
                  <p>Email: <span className="font-medium text-slate-800">{user.email}</span></p>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-2">How many additional members do you want to invite?</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={numAdditionalMembers}
                  onChange={(e) => setNumAdditionalMembers(Number(e.target.value))}
                >
                  <option value={0}>0 (I will work Solo)</option>
                  <option value={1}>1 Additional Member</option>
                  <option value={2}>2 Additional Members</option>
                  <option value={3}>3 Additional Members</option>
                </select>
              </div>

              {numAdditionalMembers > 0 && (
                <div className="space-y-4">
                  {[...Array(numAdditionalMembers)].map((_, idx) => (
                    <div key={idx} className="border border-slate-200 p-4 rounded-lg relative">
                      <span className="absolute -top-3 left-3 bg-white px-2 text-xs font-bold text-slate-500 uppercase">Additional Member {idx + 1}</span>
                      <input 
                        type="email" 
                        required 
                        placeholder={`Enter Member ${idx + 2}'s registered email`} 
                        value={memberEmails[idx]} 
                        onChange={e => handleEmailChange(idx, e.target.value)} 
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none mt-2" 
                      />
                    </div>
                  ))}
                </div>
              )}

              {numAdditionalMembers > 0 && (
                <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm flex gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>Make sure they have created an account and verified their email before you try to add them!</p>
                </div>
              )}

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                {numAdditionalMembers === 0 ? 'Create Solo Group' : 'Link Accounts & Form Group'}
              </button>
            </form>
          </div>
        </div>
      ) : allocatedRequest ? (
        <div className="bg-white rounded-xl shadow-md border border-green-200 overflow-hidden">
           <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="font-bold text-xl text-green-800">Project Allocated!</h2>
            </div>
            <button 
              onClick={() => setShowChat(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors text-sm font-medium shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              Chat with Teacher
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-800">{allocatedRequest.project.title}</h3>
              <p className="text-slate-600 mt-2">{allocatedRequest.project.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Synopsis Section */}
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-indigo-600"/> Phase 1: Synopsis
                </h4>
                
                {allocatedRequest.project.synopsisUrl ? (
                  <div className="bg-white p-4 rounded border text-sm text-slate-700">
                    <p className="font-medium text-green-600 mb-2 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Submitted</p>
                    <a href={allocatedRequest.project.synopsisUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline break-all">
                      {allocatedRequest.project.synopsisUrl}
                    </a>
                  </div>
                ) : (
                  <form onSubmit={(e) => handleSubmitSynopsis(e, allocatedRequest.project.id)} className="space-y-3">
                    <p className="text-sm text-slate-500">Submit a Google Drive or Google Docs link to your synopsis.</p>
                    <input 
                      type="url" 
                      required 
                      placeholder="https://docs.google.com/..." 
                      value={synopsisUrl}
                      onChange={(e) => setSynopsisUrl(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm w-full flex justify-center items-center gap-2">
                      <UploadCloud className="w-4 h-4"/> Submit Synopsis
                    </button>
                  </form>
                )}
              </div>

              {/* Final Project Section */}
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-teal-600"/> Phase 2: Final Project
                </h4>
                
                {allocatedRequest.project.finalUrl ? (
                  <div className="bg-white p-4 rounded border text-sm text-slate-700">
                    <p className="font-medium text-green-600 mb-2 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Submitted & Completed</p>
                    <a href={allocatedRequest.project.finalUrl} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline break-all">
                      {allocatedRequest.project.finalUrl}
                    </a>
                  </div>
                ) : (
                  <form onSubmit={(e) => handleSubmitFinal(e, allocatedRequest.project.id)} className="space-y-3">
                    <p className="text-sm text-slate-500">Submit a Github repository or Drive link to your final code.</p>
                    <input 
                      type="url" 
                      required 
                      placeholder="https://github.com/..." 
                      value={finalUrl}
                      onChange={(e) => setFinalUrl(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                    />
                    <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 text-sm w-full flex justify-center items-center gap-2">
                      <UploadCloud className="w-4 h-4"/> Submit Final Project
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
          
          {showChat && (
            <Chat 
              roomId={`project_${allocatedRequest.project.id}`} 
              currentUser={user} 
              otherPartyName={allocatedRequest.project.teacherName} 
              onClose={() => setShowChat(false)} 
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-slate-800">Available Projects</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.filter(p => p.status === 'open').map(proj => {
                const isRequested = requests.some(r => r.projectId === proj.id);
                return (
                  <div key={proj.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg text-slate-800 mb-2">{proj.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-3 bg-slate-100 w-fit px-2 py-1 rounded">
                        <Code className="w-4 h-4" /> {proj.technology}
                      </div>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-3">{proj.description}</p>
                      <p className="text-xs font-medium text-indigo-600 mb-4">Teacher: {proj.teacherName}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleRequestProject(proj.id)}
                      disabled={isRequested}
                      className={`w-full py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors ${
                        isRequested 
                          ? 'bg-slate-100 text-slate-500 cursor-not-allowed' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'
                      }`}
                    >
                      {isRequested ? <><Clock className="w-4 h-4"/> Request Pending</> : <><Send className="w-4 h-4"/> Apply for Project</>}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-5 py-4 border-b">
                <h2 className="font-bold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600"/> My Team</h2>
              </div>
              <div className="p-5 space-y-3 text-sm">
                {group.members.map((m, i) => (
                  <div key={i} className="flex flex-col border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <span className="font-bold text-slate-800">{m.name} {m.userId === group.createdBy && '(Leader)'}</span>
                    <span className="text-slate-500">Roll: {m.rollNumber} | {m.email}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-5 py-4 border-b">
                <h2 className="font-bold text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-600"/> My Requests</h2>
              </div>
              <div className="p-5 space-y-4">
                {requests.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center">No requests sent.</p>
                ) : (
                  requests.map(req => (
                    <div key={req.id} className="text-sm border rounded p-3">
                      <p className="font-bold text-slate-800 mb-1 truncate">{req.project?.title}</p>
                      <div className="flex items-center gap-2">
                        Status: 
                        <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                          req.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                          req.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {req.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
