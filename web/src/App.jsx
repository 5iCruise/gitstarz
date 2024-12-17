import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

const ProjectCard = ({ project }) => {
    // Merge tags from different sources
    const allTags = [
        ...(project.topics || []),
        ...(project.ai_tag?.tags || []),
        project.language
    ].filter(Boolean);

    // Tailwind color palette for more professional look
    const tagColors = {
        'Java': 'bg-red-600',
        'CSS': 'bg-blue-700',
        'JavaScript': 'bg-yellow-700',
        'TypeScript': 'bg-blue-500',
        'Python': 'bg-green-600',
        'React': 'bg-cyan-600',
        'Node.js': 'bg-green-700',
        'default': 'bg-gray-700'
    };

    const getTagColor = (tag) => {
        return tagColors[tag] || tagColors.default;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <a
                        href={project.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-semibold text-gray-800 hover:text-blue-700 transition-colors"
                    >
                        {project.full_name}
                    </a>
                    {project.stargazers_count !== undefined && (
                        <div className="flex items-center text-yellow-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 h-5 mr-1"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {project.stargazers_count}
                        </div>
                    )}
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>

                {project.homepage && (
                    <a
                        href={project.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 mb-4 block"
                    >
                        Project Homepage
                    </a>
                )}

                <div className="flex flex-wrap gap-2 mt-auto">
                    {allTags.map((tag) => (
                        <span
                            key={tag}
                            className={`px-2 py-1 text-xs text-white rounded-full ${getTagColor(tag)}`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProjectShowcase = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [sortMethod, setSortMethod] = useState('default'); // New state for sorting

    // Load JSON data
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const response = await fetch('/projects.json');
                const data = await response.json();
                setProjects(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading projects:', error);
                setIsLoading(false);
            }
        };

        loadProjects();
    }, []);

    // Calculate tag frequencies
    const tagFrequency = useMemo(() => {
        const frequencies = {};
        projects.forEach(project => {
            const projectTags = [
                ...(project.topics || []),
                ...(project.ai_tag?.tags || []),
                project.language
            ].filter(Boolean);

            projectTags.forEach(tag => {
                frequencies[tag] = (frequencies[tag] || 0) + 1;
            });
        });
        return frequencies;
    }, [projects]);

    // Get top 30 most used tags
    const topTags = useMemo(() => {
        return Object.entries(tagFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .map(([tag]) => tag);
    }, [tagFrequency]);

    // Fuzzy search setup
    const fuse = useMemo(() => {
        const options = {
            keys: ['full_name', 'description', 'ai_tag.tags', 'topics', 'language'],
            threshold: 0.3,
        };
        return new Fuse(projects, options);
    }, [projects]);

    // Filtered and sorted projects
    const filteredProjects = useMemo(() => {
        let result = projects;

        // Apply fuzzy search if there's a search term
        if (searchTerm) {
            result = fuse.search(searchTerm).map(r => r.item);
        }

        // Apply tag filtering
        if (selectedTags.length > 0) {
            result = result.filter(project => {
                const projectTags = [
                    ...(project.topics || []),
                    ...(project.ai_tag?.tags || []),
                    project.language
                ].filter(Boolean);

                return selectedTags.every(tag => projectTags.includes(tag));
            });
        }

        // Apply sorting
        if (sortMethod === 'stars') {
            result = [...result].sort((a, b) =>
                (b.stargazers_count || 0) - (a.stargazers_count || 0)
            );
        }

        return result;
    }, [projects, searchTerm, selectedTags, sortMethod, fuse]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-t-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
            {/* GitHub Star Button - Top Right Corner */}
            <a
                href="https://github.com/5iCruise/gitstarz"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors group"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform"
                >
                    <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z"
                        clipRule="evenodd"
                    />
                </svg>
                <span className="text-sm font-medium">Star on GitHub</span>
            </a>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-900">
                    My GitHub Project Collection
                </h1>

                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search projects (fuzzy search)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-4">
                        <label className="text-gray-700">Sort by:</label>
                        <select
                            value={sortMethod}
                            onChange={(e) => setSortMethod(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="default">Default</option>
                            <option value="stars">Star Count</option>
                        </select>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                    {topTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() =>
                                setSelectedTags(prev =>
                                    prev.includes(tag)
                                        ? prev.filter(t => t !== tag)
                                        : [...prev, tag]
                                )
                            }
                            className={`px-3 py-1 rounded-full text-sm transition-colors 
                                ${selectedTags.includes(tag)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {tag} ({tagFrequency[tag]})
                        </button>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <ProjectCard key={project.full_name} project={project}/>
                    ))}
                </div>

                {filteredProjects.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No projects found matching your search or filters
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectShowcase;
