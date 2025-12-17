import { ChangeEvent, useState } from "react"
import { Building2, Download, File, Filter, LogIn, LogOut, Search, Shield, Trash2, Upload, User } from "lucide-react"
import useAuth from "../../Hooks/useAuth"
import { useNavigate } from "react-router-dom"

type FileType = {
    id: string
    name: string
    type: string
    size: number
    date: Date
    userId?: string
}

const Home = () => {
    const {currentUser, onLogout} = useAuth()
    const [files, setFiles] = useState<FileType[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("all")
    const [sortBy, setSortBy] = useState("date")
    const navigate = useNavigate(); // Hook to handle redirection after successful login


    const formatSize = (size: number) => {
        if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + " MB"
        if (size >= 1024) return (size / 1024).toFixed(1) + " KB"
        return size + " B"
    }

    const getUserEmail = (userId?: string) => {
        if (!userId) return "unknown"
        if (currentUser && currentUser.id === userId) return currentUser.email
        return "user@example.com"
    }

    const handleDownload = (file: FileType) => {
        // placeholder download handler
        console.log("download", file)
    }

    const handleDelete = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id))
    }

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files
        if (!selected) return
        const newFiles: FileType[] = Array.from(selected).map(f => {
            const extMatch = f.name.split(".").pop()
            const type = extMatch ? extMatch.toLowerCase() : "file"
            return {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                name: f.name,
                type,
                size: f.size,
                date: new Date(),
                userId: currentUser?.id
            }
        })
        setFiles(prev => [...newFiles, ...prev])
        // reset input value to allow re-uploading same file if needed
        e.currentTarget.value = ""
    }

    const filteredFiles: FileType[] = files
        .filter(f => {
            if (filterType && filterType !== "all" && f.type !== filterType) return false
            if (!searchTerm) return true
            return f.name.toLowerCase().includes(searchTerm.toLowerCase())
        })
        .sort((a, b) => {
            if (sortBy === "size") return b.size - a.size
            return b.date.getTime() - a.date.getTime()
        })
   
        return (
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="bg-gray-900 p-1.5 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">File Manager</h1>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {currentUser ? (
                    <>
                      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                        {currentUser.isAdmin ? (
                          <Shield className="w-4 h-4 text-gray-600" />
                        ) : (
                          <User className="w-4 h-4 text-gray-600" />
                        )}
                        <div>
                          {/* <p className="text-sm text-gray-900 font-medium">{user.email}</p> */}
                          <p className="text-xs text-gray-500 capitalize">Hi {currentUser.isAdmin ? 'Admin' : "User"}!</p>
                        </div>
                      </div>
                      <button
                        onClick={onLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-700 transition text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ): (
                      <button
                      onClick={()=> navigate('/login')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-200 text-white transition text-sm"
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </button>
                  )}

                </div>
              </div>
            </header>

            {currentUser ? (
              <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Controls */}
                <div className="bg-white rounded-lg shadow-sm p-5 mb-5 border border-gray-200">
                  <div className="flex flex-wrap gap-3 mb-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 cursor-pointer transition text-sm font-medium">
                      <Upload className="w-4 h-4" />
                      Upload
                      <input
                        type="file"
                        multiple
                        accept=".json,.txt,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
        
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search documents..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                        />
                      </div>
                    </div>
                  </div>
        
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-transparent text-gray-700 focus:outline-none text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="pdf">PDF</option>
                        <option value="json">JSON</option>
                        <option value="txt">TXT</option>
                      </select>
                    </div>
        
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-500">Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent text-gray-700 focus:outline-none text-sm"
                      >
                        <option value="date">Latest</option>
                        <option value="size">Largest</option>
                      </select>
                    </div>
                  </div>
                </div>
        
                {/* Files Grid */}
                <div className="grid gap-3">
                  {filteredFiles.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
                        <File className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-900 font-medium">No documents found</p>
                      <p className="text-gray-500 text-sm mt-1">Upload your first document to get started</p>
                    </div>
                  ) : (
                    filteredFiles.map(file => (
                      <div
                        key={file.id}
                        className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-gray-300 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="bg-gray-900 p-2 rounded-lg">
                              <File className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-gray-900 font-medium text-sm mb-1">{file.name}</h3>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                                  {file.type.toUpperCase()}
                                </span>
                                <span>{formatSize(file.size)}</span>
                                <span>{file.date.toLocaleDateString()}</span>
                                {currentUser.isAdmin && (
                                  <span className="px-2 py-0.5 bg-gray-100 rounded">
                                    {getUserEmail(file.userId)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownload(file)}
                              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-gray-600"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {(currentUser.isAdmin || file.userId === currentUser.id) && (
                              <button
                                onClick={() => handleDelete(file.id)}
                                className="p-2 bg-gray-50 hover:bg-red-50 rounded-lg transition text-gray-600 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
        
                {/* Stats */}
                <div className="mt-5 text-center">
                  <p className="text-gray-500 text-sm">
                    {filteredFiles.length} of {files.length} documents
                  </p>
                </div>
              </div>
            ): (
              <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-xl mb-6">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to File Manager
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                    Manage all your files in one place
                  </p>
                  <button
                    onClick={()=> navigate('/login')}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-base font-medium"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            )
            }
      
          </div>
        )
   
}

export default Home