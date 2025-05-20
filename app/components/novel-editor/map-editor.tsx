"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/app/components/ui/button"
import { fetchProjectMap, saveProjectMap } from "@/app/lib/api/project"
import debounce from "lodash.debounce"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Input } from "@/app/components/ui/input"
import { Checkbox } from "@/app/components/ui/checkbox"
import { 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  Map, 
  MapPin, 
  MountainSnow, 
  Waves, 
  Trees, 
  Castle, 
  Home, 
  Building, 
  Crosshair,
  Undo, 
  Redo, 
  Download, 
  Eye,
  Edit2,
  Palette,
  FileUp
} from "lucide-react"
import { toast } from "react-hot-toast"

interface MapEditorProps {
  projectId: string
}

interface MapLocation {
  id: string
  name: string
  type: string
  x: number
  y: number
  description: string
  color?: string
  icon?: string
  isDragging?: boolean|undefined
}

interface MapRegion {
  id: string
  name: string
  type: string
  path: Array<{x: number, y: number}>
  description: string
  color?: string
  borderColor?: string
  fillOpacity?: number
}

interface MapData {
  id: string
  name: string
  width: number
  height: number
  background?: string
  backgroundImage?: string
  terrainFeatures: {
    mountains?: Array<{x: number, y: number, size: number, type?: string}>
    waters?: Array<{path: Array<{x: number, y: number}>, type?: string}>
    forests?: Array<{path: Array<{x: number, y: number}>, type?: string}>
    deserts?: Array<{path: Array<{x: number, y: number}>, type?: string}>
  }
  locations: MapLocation[]
  regions: MapRegion[]
}

// 历史记录类型
interface MapHistoryEntry {
  maps: MapData[]
  activeMapId: string
}

type EditorMode = "terrain" | "locations" | "regions" | "text"
type DrawingTool = "mountains" | "waters" | "forests" | "deserts" | "location" | "region" | "text" | "select" | "none"

// 选中元素类型
type SelectedElement = {
  type: "location" | "region" | "mountain" | "water" | "forest" | "desert"
  id: string
  isDragging?: boolean|undefined
}

export function MapEditor({ projectId }: MapEditorProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [maps, setMaps] = useState<MapData[]>([])
  const [activeMap, setActiveMap] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<EditorMode>("terrain")
  const [drawingTool, setDrawingTool] = useState<DrawingTool>("none")
  const [isPainting, setIsPainting] = useState(false)
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")
  
  // 区域绘制相关状态
  const [isDrawingRegion, setIsDrawingRegion] = useState(false)
  const [currentRegionPoints, setCurrentRegionPoints] = useState<Array<{x: number, y: number}>>([])
  
  // 撤销/重做相关状态
  const [history, setHistory] = useState<MapHistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // 选中元素
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)
  
  // 添加名称编辑状态
  const [editingName, setEditingName] = useState<string>("")
  const [showNameEditor, setShowNameEditor] = useState<boolean>(false)
  const [nameEditorPosition, setNameEditorPosition] = useState<{x: number, y: number}>({x: 0, y: 0})
  
  // 拖动相关状态
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{x: number, y: number}>({x: 0, y: 0})
  
  // 按钮悬停状态
  const [hoveredButton, setHoveredButton] = useState<{type: 'edit' | 'delete', elementType: string, elementId: string} | null>(null)
  
  // 创建直接引用临时绘制点，不通过状态来管理
  const drawingPointsRef = useRef<Array<{x: number, y: number}>>([])
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  
  useEffect(() => {
    loadMaps()
  }, [projectId])
  
  const loadMaps = async () => {
    setLoading(true)
    setError(null)
    try {
      const mapData = await fetchProjectMap(projectId)
      if (mapData && mapData.maps && Array.isArray(mapData.maps)) {
        setMaps(mapData.maps)
        if (mapData.maps.length > 0) {
          setActiveMap(mapData.maps[0].id)
        }
        
        // 初始化历史记录
        setHistory([{ maps: JSON.parse(JSON.stringify(mapData.maps)), activeMapId: mapData.maps.length > 0 ? mapData.maps[0].id : "" }])
        setHistoryIndex(0)
      } else {
        // Initialize with empty map if no maps exist
        const initialMap = createDefaultMap()
        setMaps([initialMap])
        setActiveMap(initialMap.id)
        
        // 初始化历史记录
        setHistory([{ maps: [initialMap], activeMapId: initialMap.id }])
        setHistoryIndex(0)
      }
    } catch (err) {
      console.error("加载地图失败:", err)
      // Initialize with empty map on error
      const initialMap = createDefaultMap()
      setMaps([initialMap])
      setActiveMap(initialMap.id)
      setError("无法加载地图，已创建新的空白地图")
      
      // 初始化历史记录
      setHistory([{ maps: [initialMap], activeMapId: initialMap.id }])
      setHistoryIndex(0)
    } finally {
      setLoading(false)
    }
  }
  
  const createDefaultMap = (): MapData => {
    return {
      id: generateId(),
      name: "新地图",
      width: 800,
      height: 600,
      background: "#e6d6a9", // 米黄色背景，类似羊皮纸
      terrainFeatures: {
        mountains: [],
        waters: [],
        forests: [],
        deserts: []
      },
      locations: [],
      regions: []
    }
  }
  
  const saveMaps = async (updatedMaps: MapData[]) => {
    setSaving(true)
    try {
      await saveProjectMap(projectId, { maps: updatedMaps })
      setSaving(false)
    } catch (err) {
      console.error("保存地图失败:", err)
      toast.error("保存地图失败，请稍后重试")
      setSaving(false)
    }
  }
  
  // Debounced save function to avoid too many API calls
  const debouncedSave = useMemo(() => debounce((updatedMaps: MapData[]) => {
    saveMaps(updatedMaps)
  }, 1000), [projectId])
  
  const getCurrentMap = (): MapData | undefined => {
    return maps.find(map => map.id === activeMap)
  }
  
  // 添加历史记录
  const addHistoryEntry = (updatedMaps: MapData[]) => {
    // 如果当前不在历史记录最后，则丢弃后面的历史记录
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ 
      maps: JSON.parse(JSON.stringify(updatedMaps)),
      activeMapId: activeMap
    })
    
    // 限制历史记录数量，避免内存占用过大
    if (newHistory.length > 30) {
      newHistory.shift()
    }
    
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }
  
  // 撤销操作
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1
      const prevState = history[prevIndex]
      setMaps(JSON.parse(JSON.stringify(prevState.maps)))
      setActiveMap(prevState.activeMapId)
      setHistoryIndex(prevIndex)
      
      // 清除选中状态
      setSelectedElement(null)
    }
  }
  
  // 重做操作
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      const nextState = history[nextIndex]
      setMaps(JSON.parse(JSON.stringify(nextState.maps)))
      setActiveMap(nextState.activeMapId)
      setHistoryIndex(nextIndex)
      
      // 清除选中状态
      setSelectedElement(null)
    }
  }
  
  const updateCurrentMap = (updatedMap: Partial<MapData>) => {
    const updatedMaps = maps.map(map => 
      map.id === activeMap ? { ...map, ...updatedMap } : map
    )
    setMaps(updatedMaps)
    
    // 添加历史记录
    addHistoryEntry(updatedMaps)
    
    debouncedSave(updatedMaps)
  }
  
  const addMap = () => {
    const newMap = createDefaultMap()
    const updatedMaps = [...maps, newMap]
    setMaps(updatedMaps)
    setActiveMap(newMap.id)
    debouncedSave(updatedMaps)
  }
  
  const deleteMap = (id: string) => {
    if (maps.length <= 1) {
      toast.error("至少保留一个地图")
      return
    }
    
    // Find an adjacent map to switch to
    const currentIndex = maps.findIndex(m => m.id === id)
    const newActiveIndex = currentIndex === 0 ? 1 : currentIndex - 1
    
    const updatedMaps = maps.filter(map => map.id !== id)
    setMaps(updatedMaps)
    setActiveMap(updatedMaps[newActiveIndex].id)
    debouncedSave(updatedMaps)
  }
  
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9)
  }
  
  const handleMapNameChange = (name: string) => {
    updateCurrentMap({ name })
  }
  
  const addLocation = (x: number, y: number) => {
    const currentMap = getCurrentMap()
    if (!currentMap) return
    
    const newLocation: MapLocation = {
      id: generateId(),
      name: `地点 ${currentMap.locations.length + 1}`,
      type: "city",
      x,
      y,
      description: ""
    }
    
    updateCurrentMap({
      locations: [...currentMap.locations, newLocation]
    })
  }
  
  const updateLocation = (id: string, updatedProps: Partial<MapLocation>) => {
    const currentMap = getCurrentMap()
    if (!currentMap) return
    
    const updatedLocations = currentMap.locations.map(location => 
      location.id === id ? { ...location, ...updatedProps } : location
    )
    
    updateCurrentMap({ locations: updatedLocations })
  }
  
  const deleteLocation = (id: string) => {
    const currentMap = getCurrentMap()
    if (!currentMap) return
    
    const updatedLocations = currentMap.locations.filter(location => location.id !== id)
    updateCurrentMap({ locations: updatedLocations })
  }
  
  const addTerrain = (type: keyof MapData['terrainFeatures'], data: any) => {
    const currentMap = getCurrentMap()
    if (!currentMap) return
    
    const updatedTerrainFeatures = { 
      ...currentMap.terrainFeatures,
      [type]: currentMap.terrainFeatures[type] ? [...currentMap.terrainFeatures[type]!, data] : [data]
    }
    
    updateCurrentMap({ terrainFeatures: updatedTerrainFeatures })
  }
  
  // 获取按钮位置
  const getButtonPositions = (elementType: string, elementId: string): { deleteX: number, deleteY: number, editX: number, editY: number } | null => {
    const currentMap = getCurrentMap();
    if (!currentMap) return null;
    
    // 初始化按钮位置
    let deleteX = 0;
    let deleteY = 0;
    let editX = 0;
    let editY = 0;
    
    if (elementType === "location") {
      const location = currentMap.locations.find(loc => loc.id === elementId);
      if (location) {
        // 把按钮放在下方，避免和拖动提示重叠
        deleteX = location.x + 30;
        deleteY = location.y + 25;
        editX = location.x - 30;
        editY = location.y + 25;
      }
    } else if (elementType === "region") {
      const region = currentMap.regions.find(r => r.id === elementId);
      if (region && region.path.length > 2) {
        const center = getPolygonCenter(region.path);
        deleteX = center.x + 30;
        deleteY = center.y + 25;
        editX = center.x - 30;
        editY = center.y + 25;
      }
    } else if (elementType === "mountain" && currentMap.terrainFeatures.mountains) {
      const index = parseInt(elementId);
      if (!isNaN(index) && index < currentMap.terrainFeatures.mountains.length) {
        const mountain = currentMap.terrainFeatures.mountains[index];
        deleteX = mountain.x + 30;
        deleteY = mountain.y + 25;
        editX = mountain.x - 30;
        editY = mountain.y + 25;
      }
    } else if (["water", "forest", "desert"].includes(elementType) && 
               currentMap.terrainFeatures[elementType + "s" as keyof typeof currentMap.terrainFeatures]) {
      const terrainType = elementType + "s" as "waters" | "forests" | "deserts";
      const features = currentMap.terrainFeatures[terrainType]!;
      const index = parseInt(elementId);
      if (!isNaN(index) && index < features.length) {
        const feature = features[index];
        if (feature.path && feature.path.length > 2) {
          const center = getPolygonCenter(feature.path);
          deleteX = center.x + 30;
          deleteY = center.y + 25;
          editX = center.x - 30;
          editY = center.y + 25;
        }
      }
    }
    
    return { deleteX, deleteY, editX, editY };
  };
  
  // 检查是否悬停在删除按钮上
  const checkDeleteButtonHover = (x: number, y: number): boolean => {
    if (!selectedElement || viewMode === "preview") return false;
    
    const buttonPositions = getButtonPositions(selectedElement.type, selectedElement.id);
    if (!buttonPositions) return false;
    
    const { deleteX, deleteY } = buttonPositions;
    
    // 检查点是否在按钮范围内 (更大的点击区域)
    const distance = Math.sqrt(Math.pow(x - deleteX, 2) + Math.pow(y - deleteY, 2));
    return distance <= 18; // 增大悬停检测范围
  };
  
  // 检查是否悬停在编辑按钮上
  const checkEditButtonHover = (x: number, y: number): boolean => {
    if (!selectedElement || viewMode === "preview" || 
        !["location", "region"].includes(selectedElement.type)) return false;
    
    const buttonPositions = getButtonPositions(selectedElement.type, selectedElement.id);
    if (!buttonPositions) return false;
    
    const { editX, editY } = buttonPositions;
    
    // 检查点是否在按钮范围内
    const distance = Math.sqrt(Math.pow(x - editX, 2) + Math.pow(y - editY, 2));
    return distance <= 18; // 增大悬停检测范围
  };
  
  // 检查是否点击了删除按钮
  const checkDeleteButtonClick = (x: number, y: number): boolean => {
    if (!selectedElement || viewMode === "preview") return false;
    
    const buttonPositions = getButtonPositions(selectedElement.type, selectedElement.id);
    if (!buttonPositions) return false;
    
    const { deleteX, deleteY } = buttonPositions;
    
    // 检查点击是否在删除按钮范围内
    const distance = Math.sqrt(Math.pow(x - deleteX, 2) + Math.pow(y - deleteY, 2));
    return distance <= 17; // 实际按钮半径 + 额外余量
  };
  
  // 检查是否点击了编辑按钮
  const checkEditButtonClick = (x: number, y: number): boolean => {
    if (!selectedElement || viewMode === "preview" || 
        !["location", "region"].includes(selectedElement.type)) return false;
    
    const buttonPositions = getButtonPositions(selectedElement.type, selectedElement.id);
    if (!buttonPositions) return false;
    
    const { editX, editY } = buttonPositions;
    
    // 检查点击是否在编辑按钮范围内
    const distance = Math.sqrt(Math.pow(x - editX, 2) + Math.pow(y - editY, 2));
    return distance <= 17; // 实际按钮半径 + 额外余量
  };
  
  // 处理选中元素的功能
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (viewMode === "preview") return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // 检查是否点击了删除按钮
    if (selectedElement && checkDeleteButtonClick(x, y)) {
      deleteSelectedElement();
      return;
    }
    
    // 检查是否点击了编辑按钮
    if (selectedElement && checkEditButtonClick(x, y)) {
      // 打开名称编辑器
      openNameEditor(selectedElement);
      return;
    }
    
    if (drawingTool === "select") {
      // 选择工具逻辑
      const element = findElementAtPosition(x, y)
      setSelectedElement(element)
      renderCanvas() // 重新渲染以显示选中效果
      return
    }
    
    // 清除选中状态
    setSelectedElement(null)
    
    if (drawingTool === "location") {
      addLocation(x, y)
    } else if (drawingTool === "mountains") {
      addTerrain("mountains", { x, y, size: 30 })
    } else if (drawingTool === "waters") {
      // Create a simple circle of water
      const radius = 40
      const numPoints = 8
      const path = []
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2
        path.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius
        })
      }
      addTerrain("waters", { path, type: "lake" })
    } else if (drawingTool === "forests") {
      // Create a simple circle of forest
      const radius = 35
      const numPoints = 8
      const path = []
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2
        path.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius
        })
      }
      addTerrain("forests", { path, type: "forest" })
    } else if (drawingTool === "deserts") {
      // Create a simple circle of desert
      const radius = 45
      const numPoints = 6
      const path = []
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2
        path.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius
        })
      }
      addTerrain("deserts", { path, type: "desert" })
    } else if (drawingTool === "region") {
      if (!isDrawingRegion) {
        console.log('[区域绘制] 开始绘制新区域，点击位置:', { x, y })
        
        // 开始绘制新区域
        drawingPointsRef.current = [{ x, y }]
        setIsDrawingRegion(true)
        setCurrentRegionPoints([...drawingPointsRef.current])
        
        // 使用临时DOM元素直接显示红色起点
        console.log('[区域绘制] 创建临时DOM元素作为红点标记')
        const tempPoint = document.createElement('div')
        tempPoint.style.position = 'absolute'
        tempPoint.style.left = `${e.clientX - 6}px` // 6px是圆点半径
        tempPoint.style.top = `${e.clientY - 6}px`
        tempPoint.style.width = '12px'
        tempPoint.style.height = '12px'
        tempPoint.style.borderRadius = '50%'
        tempPoint.style.backgroundColor = '#e24a4a'
        tempPoint.style.zIndex = '1000'
        tempPoint.style.pointerEvents = 'none' // 避免干扰后续点击
        tempPoint.id = 'temp-point-marker'
        
        console.log('[区域绘制] mapContainerRef是否存在:', !!mapContainerRef.current)
        if (mapContainerRef.current) {
          console.log('[区域绘制] 将临时红点添加到容器')
          mapContainerRef.current.appendChild(tempPoint)
          console.log('[区域绘制] 临时红点已添加到DOM')
          
          // 短暂延迟后移除临时DOM元素
          setTimeout(() => {
            console.log('[区域绘制] 尝试移除临时红点')
            const el = document.getElementById('temp-point-marker')
            console.log('[区域绘制] temp-point-marker元素是否存在:', !!el)
            if (el) {
              el.remove()
              console.log('[区域绘制] 临时红点已移除')
            }
          }, 300)
        } else {
          console.error('[区域绘制] 地图容器引用不存在，无法添加临时红点')
        }
        
        // 尝试使用另一种方法
        console.log('[区域绘制] 尝试使用document.body添加红点')
        const bodyTempPoint = document.createElement('div')
        bodyTempPoint.style.position = 'fixed'
        bodyTempPoint.style.left = `${e.clientX - 6}px`
        bodyTempPoint.style.top = `${e.clientY - 6}px`
        bodyTempPoint.style.width = '12px'
        bodyTempPoint.style.height = '12px'
        bodyTempPoint.style.borderRadius = '50%'
        bodyTempPoint.style.backgroundColor = 'red' // 使用纯红色便于识别
        bodyTempPoint.style.zIndex = '9999'
        bodyTempPoint.style.pointerEvents = 'none'
        bodyTempPoint.id = 'body-temp-point-marker'
        document.body.appendChild(bodyTempPoint)
        console.log('[区域绘制] 已将红点添加到document.body')
        
        setTimeout(() => {
          const el = document.getElementById('body-temp-point-marker')
          if (el) {
            el.remove()
            console.log('[区域绘制] 已从body移除临时红点')
          }
        }, 1000) // 延长时间以便于观察
        
        // 立即绘制到Canvas上
        console.log('[区域绘制] 立即绘制到Canvas')
        const ctx = canvas.getContext('2d')
        if (ctx) {
          console.log('[区域绘制] Canvas上下文获取成功，开始绘制')
          
          // 绘制起点(红点)
          ctx.fillStyle = '#e24a4a'
          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fill()
          
          // 绘制第一个顶点(蓝点)
          ctx.fillStyle = '#4a90e2'
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fill()
          
          console.log('[区域绘制] Canvas绘制完成')
        } else {
          console.error('[区域绘制] 无法获取Canvas上下文')
        }
      } else {
        // 我们已经在绘制区域
        // 检查是否点击接近起点，如果是则完成区域绘制
        const startPoint = drawingPointsRef.current[0]
        const distToStart = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2))
        
        if (drawingPointsRef.current.length > 2 && distToStart < 20) {
          // 完成区域绘制
          completeRegionDrawing()
        } else {
          // 使用临时DOM元素直接显示点
          const tempPoint = document.createElement('div')
          tempPoint.style.position = 'absolute'
          tempPoint.style.left = `${e.clientX - 4}px` // 4px是蓝点半径
          tempPoint.style.top = `${e.clientY - 4}px`
          tempPoint.style.width = '8px'
          tempPoint.style.height = '8px'
          tempPoint.style.borderRadius = '50%'
          tempPoint.style.backgroundColor = '#4a90e2'
          tempPoint.style.zIndex = '1000'
          tempPoint.style.pointerEvents = 'none' // 避免干扰后续点击
          tempPoint.id = `temp-point-marker-${drawingPointsRef.current.length}`
          
          if (mapContainerRef.current) {
            mapContainerRef.current.appendChild(tempPoint)
            
            // 短暂延迟后移除临时DOM元素
            setTimeout(() => {
              const el = document.getElementById(`temp-point-marker-${drawingPointsRef.current.length - 1}`)
              if (el) el.remove()
            }, 300)
          }
            
          // 添加新的顶点
          drawingPointsRef.current.push({ x, y })
          setCurrentRegionPoints([...drawingPointsRef.current])
            
          // 立即绘制线段和点
          const ctx = canvas.getContext('2d')
          if (ctx) {
            const lastPoint = drawingPointsRef.current[drawingPointsRef.current.length - 2]
            
            // 绘制线段
            ctx.strokeStyle = '#4a90e2'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 3])
            ctx.beginPath()
            ctx.moveTo(lastPoint.x, lastPoint.y)
            ctx.lineTo(x, y)
            ctx.stroke()
            ctx.setLineDash([])
            
            // 绘制点
            ctx.fillStyle = '#4a90e2'
            ctx.beginPath()
            ctx.arc(x, y, 4, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
    }
    
    // 完整渲染以更新所有元素
    renderCanvas()
    return // 不执行下面的renderCanvas
  }
  
  // 查找点击位置的元素
  const findElementAtPosition = (x: number, y: number): SelectedElement | null => {
    const currentMap = getCurrentMap()
    if (!currentMap) return null
    
    // 首先检查位置点 (优先检查小元素)
    for (let i = 0; i < currentMap.locations.length; i++) {
      const location = currentMap.locations[i]
      const distance = Math.sqrt(Math.pow(location.x - x, 2) + Math.pow(location.y - y, 2))
      
      if (distance <= 10) { // 10px 判定范围
        // 只返回选中的元素，不再立即显示编辑器
        return { type: "location", id: location.id }
      }
    }
    
    // 检查山脉
    if (currentMap.terrainFeatures.mountains) {
      for (let i = 0; i < currentMap.terrainFeatures.mountains.length; i++) {
        const mountain = currentMap.terrainFeatures.mountains[i]
        
        // 检查点是否在三角形内
        const points = [
          { x: mountain.x, y: mountain.y },
          { x: mountain.x - mountain.size/2, y: mountain.y + mountain.size },
          { x: mountain.x + mountain.size/2, y: mountain.y + mountain.size }
        ]
        
        if (isPointInPolygon({ x, y }, points)) {
          return { type: "mountain", id: i.toString() }
        }
      }
    }
    
    // 检查区域 (regions)
    for (let i = 0; i < currentMap.regions.length; i++) {
      const region = currentMap.regions[i]
      
      if (region.path.length >= 3 && isPointInPolygon({ x, y }, region.path)) {
        // 只返回选中的元素，不再立即显示编辑器
        return { type: "region", id: region.id }
      }
    }
    
    // 检查水域
    if (currentMap.terrainFeatures.waters) {
      for (let i = 0; i < currentMap.terrainFeatures.waters.length; i++) {
        const water = currentMap.terrainFeatures.waters[i]
        
        if (water.path.length >= 3 && isPointInPolygon({ x, y }, water.path)) {
          return { type: "water", id: i.toString() }
        }
      }
    }
    
    // 检查森林
    if (currentMap.terrainFeatures.forests) {
      for (let i = 0; i < currentMap.terrainFeatures.forests.length; i++) {
        const forest = currentMap.terrainFeatures.forests[i]
        
        if (forest.path.length >= 3 && isPointInPolygon({ x, y }, forest.path)) {
          return { type: "forest", id: i.toString() }
        }
      }
    }
    
    // 检查沙漠
    if (currentMap.terrainFeatures.deserts) {
      for (let i = 0; i < currentMap.terrainFeatures.deserts.length; i++) {
        const desert = currentMap.terrainFeatures.deserts[i]
        
        if (desert.path.length >= 3 && isPointInPolygon({ x, y }, desert.path)) {
          return { type: "desert", id: i.toString() }
        }
      }
    }
    
    // 如果没有选中元素，隐藏名称编辑器
    setShowNameEditor(false)
    return null
  }
  
  // 判断点是否在多边形内
  const isPointInPolygon = (point: {x: number, y: number}, polygon: Array<{x: number, y: number}>): boolean => {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y
      const xj = polygon[j].x, yj = polygon[j].y
      
      const intersect = ((yi > point.y) !== (yj > point.y))
          && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    return inside
  }
  
  // 删除选中的元素
  const deleteSelectedElement = () => {
    if (!selectedElement) return
    
    const currentMap = getCurrentMap()
    if (!currentMap) return
    
    let updatedMap: Partial<MapData> = {}
    
    switch (selectedElement.type) {
      case "location":
        updatedMap = {
          locations: currentMap.locations.filter(loc => loc.id !== selectedElement.id)
        }
        break
      case "region":
        updatedMap = {
          regions: currentMap.regions.filter(region => region.id !== selectedElement.id)
        }
        break
      case "mountain":
        const mountainIndex = parseInt(selectedElement.id)
        if (!isNaN(mountainIndex) && currentMap.terrainFeatures.mountains) {
          const updatedMountains = [...currentMap.terrainFeatures.mountains]
          updatedMountains.splice(mountainIndex, 1)
          updatedMap = {
            terrainFeatures: {
              ...currentMap.terrainFeatures,
              mountains: updatedMountains
            }
          }
        }
        break
      case "water":
        const waterIndex = parseInt(selectedElement.id)
        if (!isNaN(waterIndex) && currentMap.terrainFeatures.waters) {
          const updatedWaters = [...currentMap.terrainFeatures.waters]
          updatedWaters.splice(waterIndex, 1)
          updatedMap = {
            terrainFeatures: {
              ...currentMap.terrainFeatures,
              waters: updatedWaters
            }
          }
        }
        break
      case "forest":
        const forestIndex = parseInt(selectedElement.id)
        if (!isNaN(forestIndex) && currentMap.terrainFeatures.forests) {
          const updatedForests = [...currentMap.terrainFeatures.forests]
          updatedForests.splice(forestIndex, 1)
          updatedMap = {
            terrainFeatures: {
              ...currentMap.terrainFeatures,
              forests: updatedForests
            }
          }
        }
        break
      case "desert":
        const desertIndex = parseInt(selectedElement.id)
        if (!isNaN(desertIndex) && currentMap.terrainFeatures.deserts) {
          const updatedDeserts = [...currentMap.terrainFeatures.deserts]
          updatedDeserts.splice(desertIndex, 1)
          updatedMap = {
            terrainFeatures: {
              ...currentMap.terrainFeatures,
              deserts: updatedDeserts
            }
          }
        }
        break
    }
    
    updateCurrentMap(updatedMap)
    setSelectedElement(null)
    renderCanvas()
  }
  
  // 添加完成区域绘制的函数
  const completeRegionDrawing = () => {
    const currentMap = getCurrentMap()
    if (!currentMap || drawingPointsRef.current.length < 3) return
    
    const newRegion: MapRegion = {
      id: generateId(),
      name: `区域 ${currentMap.regions.length + 1}`,
      type: "region",
      path: [...drawingPointsRef.current], // 使用drawingPointsRef中的点
      description: "",
      color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`,
      borderColor: "#666"
    }
    
    updateCurrentMap({
      regions: [...currentMap.regions, newRegion]
    })
    
    // 重置绘制状态
    setIsDrawingRegion(false)
    drawingPointsRef.current = []
    setCurrentRegionPoints([])
  }
  
  // 修改 renderCanvas 函数，增加选中元素的高亮显示
  const renderCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const currentMap = getCurrentMap()
    if (!currentMap) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Set background color
    if (currentMap.background) {
      ctx.fillStyle = currentMap.background
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    
    // Draw terrains features
    drawTerrainFeatures(ctx, currentMap)
    
    // Draw regions
    drawRegions(ctx, currentMap)
    
    // Draw locations
    drawLocations(ctx, currentMap)
    
    // 绘制正在创建的区域预览
    const drawingPoints = drawingPointsRef.current
    if (isDrawingRegion && drawingPoints.length > 0) {
      ctx.strokeStyle = '#4a90e2'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 3])
      
      // 绘制已经添加的点
      ctx.beginPath()
      ctx.moveTo(drawingPoints[0].x, drawingPoints[0].y)
      
      for (let i = 1; i < drawingPoints.length; i++) {
        ctx.lineTo(drawingPoints[i].x, drawingPoints[i].y)
      }
      
      // 如果有超过一个点，添加回到起点的线以形成闭合区域
      if (drawingPoints.length > 2) {
        ctx.lineTo(drawingPoints[0].x, drawingPoints[0].y)
      }
      
      ctx.stroke()
      ctx.setLineDash([])
      
      // 绘制顶点
      ctx.fillStyle = '#4a90e2'
      drawingPoints.forEach(point => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
        ctx.fill()
      })
      
      // 特别标记起点，如果点击接近它可以完成区域
      ctx.fillStyle = '#e24a4a'
      ctx.beginPath()
      ctx.arc(drawingPoints[0].x, drawingPoints[0].y, 6, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // 高亮显示选中的元素
    if (selectedElement && viewMode === "edit") {
      const { type, id } = selectedElement
      ctx.strokeStyle = '#ff3e00'
      ctx.lineWidth = 2
      
      // 获取按钮位置
      const buttonPositions = getButtonPositions(type, id);
      
      if (type === "location") {
        const location = currentMap.locations.find(loc => loc.id === id)
        if (location && buttonPositions) {
          const { deleteX, deleteY, editX, editY } = buttonPositions;
          
          // 绘制选中效果
          ctx.beginPath()
          ctx.arc(location.x, location.y, 10, 0, Math.PI * 2)
          ctx.stroke()
          
          // 在地点上方显示控制面板背景
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
          ctx.beginPath()
          ctx.roundRect(location.x - 65, location.y - 50, 130, 30, 5)
          ctx.fill()
          
          // 绘制拖动提示
          ctx.fillStyle = '#fff'
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('选择模式下可拖动', location.x, location.y - 30)
          
          // 检查按钮是否处于悬停状态
          const isDeleteHovered = !!(hoveredButton && 
                                 hoveredButton.type === 'delete' && 
                                 hoveredButton.elementType === type && 
                                 hoveredButton.elementId === id);
                                 
          const isEditHovered = !!(hoveredButton && 
                              hoveredButton.type === 'edit' && 
                              hoveredButton.elementType === type && 
                              hoveredButton.elementId === id);
          
          // 绘制删除按钮
          drawDeleteButton(ctx, deleteX, deleteY, isDeleteHovered || false);
          
          // 绘制编辑按钮
          drawEditButton(ctx, editX, editY, isEditHovered || false);
        }
      } else if (type === "region") {
        const region = currentMap.regions.find(r => r.id === id)
        if (region && region.path.length > 2 && buttonPositions) {
          const { deleteX, deleteY, editX, editY } = buttonPositions;
          
          // 绘制选中效果
          ctx.beginPath()
          ctx.moveTo(region.path[0].x, region.path[0].y)
          region.path.slice(1).forEach(point => {
            ctx.lineTo(point.x, point.y)
          })
          ctx.closePath()
          ctx.stroke()
          
          // 获取中心位置
          const center = getPolygonCenter(region.path)
          
          // 绘制控制面板背景
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
          ctx.beginPath()
          ctx.roundRect(center.x - 65, center.y - 50, 130, 30, 5)
          ctx.fill()
          
          // 绘制拖动提示
          ctx.fillStyle = '#fff'
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('选择模式下可拖动', center.x, center.y - 30)
          
                     // 检查按钮是否处于悬停状态
           const isDeleteHovered = !!(hoveredButton && 
                                 hoveredButton.type === 'delete' && 
                                 hoveredButton.elementType === type && 
                                 hoveredButton.elementId === id);
                                 
           const isEditHovered = !!(hoveredButton && 
                                hoveredButton.type === 'edit' && 
                                hoveredButton.elementType === type && 
                                hoveredButton.elementId === id);
          
          // 绘制删除按钮
          drawDeleteButton(ctx, deleteX, deleteY, isDeleteHovered || false);
          
          // 绘制编辑按钮
          drawEditButton(ctx, editX, editY, isEditHovered || false);
        }
      } else if (type === "mountain" && currentMap.terrainFeatures.mountains) {
        const index = parseInt(id)
        if (!isNaN(index) && index < currentMap.terrainFeatures.mountains.length && buttonPositions) {
          const { deleteX, deleteY } = buttonPositions;
          const mountain = currentMap.terrainFeatures.mountains[index]
          
          // 绘制选中效果
          ctx.beginPath()
          ctx.moveTo(mountain.x, mountain.y)
          ctx.lineTo(mountain.x - mountain.size/2, mountain.y + mountain.size)
          ctx.lineTo(mountain.x + mountain.size/2, mountain.y + mountain.size)
          ctx.closePath()
          ctx.stroke()
          
          // 绘制控制面板背景
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
          ctx.beginPath()
          ctx.roundRect(mountain.x - 65, mountain.y - 50, 130, 30, 5)
          ctx.fill()
          
          // 绘制拖动提示
          ctx.fillStyle = '#fff'
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('选择模式下可拖动', mountain.x, mountain.y - 30)
          
          // 检查按钮是否处于悬停状态
          const isDeleteHovered = hoveredButton && 
                                hoveredButton.type === 'delete' && 
                                hoveredButton.elementType === type && 
                                hoveredButton.elementId === id;
          
          // 绘制删除按钮
          drawDeleteButton(ctx, deleteX, deleteY, isDeleteHovered || false);
        }
      } else if ((type === "water" || type === "forest" || type === "desert") && currentMap.terrainFeatures[type + "s" as keyof typeof currentMap.terrainFeatures]) {
        const terrainType = type + "s" as "waters" | "forests" | "deserts"
        const features = currentMap.terrainFeatures[terrainType]!
        const index = parseInt(id)
        if (!isNaN(index) && index < features.length && buttonPositions) {
          const { deleteX, deleteY } = buttonPositions;
          const feature = features[index]
          if (feature.path && feature.path.length > 2) {
            // 绘制选中效果
            ctx.beginPath()
            ctx.moveTo(feature.path[0].x, feature.path[0].y)
            feature.path.slice(1).forEach((point: {x: number, y: number}) => {
              ctx.lineTo(point.x, point.y)
            })
            ctx.closePath()
            ctx.stroke()
            
            // 获取中心位置
            const center = getPolygonCenter(feature.path)
            
            // 绘制控制面板背景
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
            ctx.beginPath()
            ctx.roundRect(center.x - 65, center.y - 50, 130, 30, 5)
            ctx.fill()
            
            // 绘制拖动提示
            ctx.fillStyle = '#fff'
            ctx.font = '12px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('选择模式下可拖动', center.x, center.y - 30)
            
            // 检查按钮是否处于悬停状态
            const isDeleteHovered = hoveredButton && 
                                  hoveredButton.type === 'delete' && 
                                  hoveredButton.elementType === type && 
                                  hoveredButton.elementId === id;
            
            // 绘制删除按钮
            drawDeleteButton(ctx, deleteX, deleteY, isDeleteHovered || false);
          }
        }
      }
    }
  }
  
  const drawTerrainFeatures = (ctx: CanvasRenderingContext2D, map: MapData) => {
    // Draw mountains
    if (map.terrainFeatures.mountains) {
      map.terrainFeatures.mountains.forEach(mountain => {
        // Simplified mountain drawing
        ctx.fillStyle = '#8c8c8c'
        ctx.beginPath()
        ctx.moveTo(mountain.x, mountain.y)
        ctx.lineTo(mountain.x - mountain.size/2, mountain.y + mountain.size)
        ctx.lineTo(mountain.x + mountain.size/2, mountain.y + mountain.size)
        ctx.closePath()
        ctx.fill()
      })
    }
    
    // Draw water bodies
    if (map.terrainFeatures.waters) {
      map.terrainFeatures.waters.forEach(water => {
        if (water.path.length < 2) return
        
        ctx.fillStyle = 'rgba(65, 105, 225, 0.7)'
        ctx.beginPath()
        ctx.moveTo(water.path[0].x, water.path[0].y)
        water.path.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y)
        })
        ctx.closePath()
        ctx.fill()
      })
    }
    
    // Draw forests
    if (map.terrainFeatures.forests) {
      map.terrainFeatures.forests.forEach(forest => {
        if (forest.path.length < 2) return
        
        ctx.fillStyle = 'rgba(34, 139, 34, 0.7)'
        ctx.beginPath()
        ctx.moveTo(forest.path[0].x, forest.path[0].y)
        forest.path.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y)
        })
        ctx.closePath()
        ctx.fill()
      })
    }
    
    // Draw deserts
    if (map.terrainFeatures.deserts) {
      map.terrainFeatures.deserts.forEach(desert => {
        if (desert.path.length < 2) return
        
        ctx.fillStyle = 'rgba(210, 180, 140, 0.7)'
        ctx.beginPath()
        ctx.moveTo(desert.path[0].x, desert.path[0].y)
        desert.path.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y)
        })
        ctx.closePath()
        ctx.fill()
      })
    }
  }
  
  const drawRegions = (ctx: CanvasRenderingContext2D, map: MapData) => {
    map.regions.forEach(region => {
      if (region.path.length < 2) return
      
      // Draw region fill
      ctx.fillStyle = region.color || 'rgba(200, 200, 200, 0.3)'
      ctx.beginPath()
      ctx.moveTo(region.path[0].x, region.path[0].y)
      region.path.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y)
      })
      ctx.closePath()
      ctx.fill()
      
      // Draw region border
      ctx.strokeStyle = region.borderColor || '#666'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Draw region name
      if (region.name) {
        const center = getPolygonCenter(region.path)
        ctx.fillStyle = '#000'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(region.name, center.x, center.y)
      }
    })
  }
  
  const drawLocations = (ctx: CanvasRenderingContext2D, map: MapData) => {
    map.locations.forEach(location => {
      // Draw location marker
      ctx.fillStyle = location.color || '#d00'
      ctx.beginPath()
      ctx.arc(location.x, location.y, 5, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw location name
      if (location.name) {
        ctx.fillStyle = '#000'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(location.name, location.x, location.y + 20)
      }
    })
  }
  
  const getPolygonCenter = (points: Array<{x: number, y: number}>) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    
    points.forEach(point => {
      minX = Math.min(minX, point.x)
      maxX = Math.max(maxX, point.x)
      minY = Math.min(minY, point.y)
      maxY = Math.max(maxY, point.y)
    })
    
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2
    }
  }
  
  // 绘制删除按钮
  const drawDeleteButton = (ctx: CanvasRenderingContext2D, x: number, y: number, isHovered = false) => {
    // 绘制按钮背景 - 使用渐变效果提升美观度
    const radius = isHovered ? 16 : 15;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    
    if (isHovered) {
      gradient.addColorStop(0, '#fb7185'); // 亮一些的红色
      gradient.addColorStop(1, '#f43f5e');
    } else {
      gradient.addColorStop(0, '#f43f5e'); 
      gradient.addColorStop(1, '#e11d48');
    }
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 重置阴影设置
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 绘制删除图标 (X)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    // 绘制X图标 - 更精致的线条
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 5);
    ctx.lineTo(x + 5, y + 5);
    ctx.moveTo(x + 5, y - 5);
    ctx.lineTo(x - 5, y + 5);
    ctx.stroke();
    
    // 在删除按钮周围添加点击区域数据
    return {
      x,
      y,
      radius: radius + 2 // 扩大点击区域
    }
  }
  
  // 绘制编辑按钮
  const drawEditButton = (ctx: CanvasRenderingContext2D, x: number, y: number, isHovered = false) => {
    // 绘制按钮背景 - 使用渐变效果提升美观度
    const radius = isHovered ? 16 : 15;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    
    if (isHovered) {
      gradient.addColorStop(0, '#93c5fd'); // 亮一些的蓝色
      gradient.addColorStop(1, '#60a5fa');
    } else {
      gradient.addColorStop(0, '#60a5fa');
      gradient.addColorStop(1, '#3b82f6');
    }
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 重置阴影设置
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 绘制编辑图标 (铅笔)
    ctx.fillStyle = 'white';
    
    // 绘制更精致的铅笔图标 - 放大约20%
    ctx.beginPath();
    // 铅笔主体
    ctx.moveTo(x - 5, y + 5); // 左下
    ctx.lineTo(x - 3, y + 7); // 铅笔底部
    ctx.lineTo(x + 6, y - 2); // 铅笔顶部右侧
    ctx.lineTo(x + 4, y - 4); // 铅笔顶部左侧
    ctx.closePath();
    ctx.fill();
    
    // 铅笔尖
    ctx.beginPath();
    ctx.moveTo(x + 4, y - 4);
    ctx.lineTo(x + 6, y - 2);
    ctx.lineTo(x + 7, y - 3);
    ctx.closePath();
    ctx.fillStyle = '#f0f0f0';
    ctx.fill();
    
    // 在编辑按钮周围添加点击区域数据
    return {
      x,
      y,
      radius: radius + 2 // 扩大点击区域
    }
  }
  
  // 修改键盘监听，避免在输入框内按退格键删除元素
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果事件来自输入框、文本区域等表单元素，只处理ESC和Enter键
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement || 
          e.target instanceof HTMLSelectElement) {
        // 只对ESC和Enter键做处理，忽略其他键
        if (e.key === 'Escape' && showNameEditor) {
          setShowNameEditor(false)
        }
        if (e.key === 'Enter' && showNameEditor) {
          handleNameEditorClose()
        }
        return // 对于表单元素中的其他键，不执行任何操作
      }
      
      // 以下处理非表单元素的键盘事件
      // ESC 取消绘制
      if (e.key === 'Escape') {
        if (isDrawingRegion) {
          setIsDrawingRegion(false)
          drawingPointsRef.current = []
          setCurrentRegionPoints([])
          renderCanvas()
        }
        if (showNameEditor) {
          setShowNameEditor(false)
        }
      }
      
      // Delete/Backspace 删除选中元素 - 只在非输入框中触发
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        deleteSelectedElement()
      }
      
      // Enter 提交名称编辑
      if (e.key === 'Enter' && showNameEditor) {
        handleNameEditorClose()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDrawingRegion, selectedElement, showNameEditor])
  
  // 更新 drawingTool 变更处理，重置区域绘制状态
  useEffect(() => {
    if (drawingTool !== 'region' && isDrawingRegion) {
      setIsDrawingRegion(false)
      drawingPointsRef.current = []
      setCurrentRegionPoints([])
    }
  }, [drawingTool])
  
  // Effect to render canvas whenever relevant data changes
  useEffect(() => {
    renderCanvas()
  }, [activeMap, maps, viewMode])
  
  // Initialize canvas size when component mounts or map changes
  useEffect(() => {
    const currentMap = getCurrentMap()
    if (!currentMap || !canvasRef.current) return
    
    console.log('[地图初始化] 设置Canvas尺寸:', { width: currentMap.width, height: currentMap.height })
    canvasRef.current.width = currentMap.width
    canvasRef.current.height = currentMap.height
    
    // 立即渲染地图内容
    renderCanvas()
  }, [activeMap, maps])
  
  // 单独监听地图选项卡变化，确保立即渲染
  useEffect(() => {
    console.log('[地图切换] 检测到地图选项卡变化:', activeMap)
    if (canvasRef.current) {
      console.log('[地图切换] 强制触发地图重绘')
      // 强制重新渲染，确保地图内容在切换后立即显示
      setTimeout(() => renderCanvas(), 50)
    }
  }, [activeMap])
  
  // 打开名称编辑器
  const openNameEditor = (element: SelectedElement) => {
    const currentMap = getCurrentMap();
    if (!currentMap) return;
    
    // 获取Canvas的位置信息以计算正确的屏幕坐标
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const canvasLeft = rect.left;
    const canvasTop = rect.top;
    
    let name = "";
    let position = {x: 0, y: 0};
    
    if (element.type === "location") {
      const location = currentMap.locations.find(loc => loc.id === element.id);
      if (location) {
        name = location.name;
        position = {
          x: canvasLeft + location.x,
          y: canvasTop + location.y - 80 // 在元素上方显示，避免遮挡
        };
      }
    } else if (element.type === "region") {
      const region = currentMap.regions.find(r => r.id === element.id);
      if (region && region.path.length > 2) {
        name = region.name;
        const center = getPolygonCenter(region.path);
        position = {
          x: canvasLeft + center.x,
          y: canvasTop + center.y - 80 // 在元素上方显示，避免遮挡
        };
      }
    }
    
    if (name !== undefined && position.x && position.y) {
      // 延迟显示以确保其他UI元素已经更新
      setTimeout(() => {
        setEditingName(name);
        setNameEditorPosition(position);
        setShowNameEditor(true);
        
        // 如果编辑器超出屏幕顶部，则调整位置到元素下方
        if (position.y < 150) {
          if (element.type === "location") {
            const location = currentMap.locations.find(loc => loc.id === element.id);
            if (location) {
              setNameEditorPosition({
                x: canvasLeft + location.x,
                y: canvasTop + location.y + 50 // 改为元素下方
              });
            }
          } else if (element.type === "region") {
            const region = currentMap.regions.find(r => r.id === element.id);
            if (region && region.path.length > 2) {
              const center = getPolygonCenter(region.path);
              setNameEditorPosition({
                x: canvasLeft + center.x,
                y: canvasTop + center.y + 50 // 改为元素下方
              });
            }
          }
        }
      }, 50);
    }
  };
  
  // 添加更新元素名称的函数
  const updateElementName = (name: string) => {
    if (!selectedElement || !showNameEditor) return
    
    const currentMap = getCurrentMap()
    if (!currentMap) return
    
    let updatedMap: Partial<MapData> = {}
    
    if (selectedElement.type === "location") {
      const updatedLocations = currentMap.locations.map(location => 
        location.id === selectedElement.id ? { ...location, name } : location
      )
      updatedMap = { locations: updatedLocations }
    } else if (selectedElement.type === "region") {
      const updatedRegions = currentMap.regions.map(region => 
        region.id === selectedElement.id ? { ...region, name } : region
      )
      updatedMap = { regions: updatedRegions }
    }
    
    updateCurrentMap(updatedMap)
    setEditingName(name)
  }
  
  // 处理名称编辑器关闭
  const handleNameEditorClose = () => {
    setShowNameEditor(false)
    renderCanvas() // 重新渲染以更新名称显示
  }
  
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="rounded-lg border p-4 mb-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-2" onClick={loadMaps}>重试</Button>
      </div>
    )
  }
  
  // 鼠标按下事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (viewMode === "preview" || drawingTool !== "select" || !selectedElement || isDrawingRegion) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({x, y});
    
    // 防止拖动过程中选择其他元素
    e.preventDefault();
  };
  
  // 鼠标移动事件处理
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || viewMode === "preview") return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 处理按钮悬停状态
    if (selectedElement && drawingTool === "select" && !isDragging) {
      // 检查是否悬停在删除按钮上
      const isHoveringDeleteButton = checkDeleteButtonHover(x, y);
      // 检查是否悬停在编辑按钮上
      const isHoveringEditButton = checkEditButtonHover(x, y);
      
      if (isHoveringDeleteButton) {
        setHoveredButton({
          type: 'delete',
          elementType: selectedElement.type,
          elementId: selectedElement.id
        });
        canvas.style.cursor = 'pointer';
      } else if (isHoveringEditButton) {
        setHoveredButton({
          type: 'edit',
          elementType: selectedElement.type,
          elementId: selectedElement.id
        });
        canvas.style.cursor = 'pointer';
      } else {
        setHoveredButton(null);
        canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
      
      renderCanvas();
    }
    
    // 处理拖动逻辑
    if (!isDragging || !selectedElement) return;
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    // 根据选中元素类型更新位置
    const currentMap = getCurrentMap();
    if (!currentMap) return;
    
    let updatedMap: Partial<MapData> = {};
    
    if (selectedElement.type === "location") {
      const updatedLocations = currentMap.locations.map(location => 
        location.id === selectedElement.id 
          ? { ...location, x: location.x + deltaX, y: location.y + deltaY } 
          : location
      );
      updatedMap = { locations: updatedLocations };
    } else if (selectedElement.type === "region") {
      const region = currentMap.regions.find(r => r.id === selectedElement.id);
      if (region) {
        const updatedRegions = currentMap.regions.map(r => 
          r.id === selectedElement.id 
            ? { 
                ...r, 
                path: r.path.map(point => ({ 
                  x: point.x + deltaX, 
                  y: point.y + deltaY 
                }))
              } 
            : r
        );
        updatedMap = { regions: updatedRegions };
      }
    } else if (selectedElement.type === "mountain" && currentMap.terrainFeatures.mountains) {
      const index = parseInt(selectedElement.id);
      if (!isNaN(index) && index < currentMap.terrainFeatures.mountains.length) {
        const updatedMountains = [...currentMap.terrainFeatures.mountains];
        updatedMountains[index] = {
          ...updatedMountains[index],
          x: updatedMountains[index].x + deltaX,
          y: updatedMountains[index].y + deltaY
        };
        updatedMap = {
          terrainFeatures: {
            ...currentMap.terrainFeatures,
            mountains: updatedMountains
          }
        };
      }
    } else if (["water", "forest", "desert"].includes(selectedElement.type) && currentMap.terrainFeatures[selectedElement.type + "s" as keyof typeof currentMap.terrainFeatures]) {
      const terrainType = selectedElement.type + "s" as "waters" | "forests" | "deserts";
      const features = currentMap.terrainFeatures[terrainType]!;
      const index = parseInt(selectedElement.id);
      
      if (!isNaN(index) && index < features.length) {
        const updatedFeatures = [...features];
        updatedFeatures[index] = {
          ...updatedFeatures[index],
          path: updatedFeatures[index].path.map((point: {x: number, y: number}) => ({
            x: point.x + deltaX,
            y: point.y + deltaY
          }))
        };
        
        updatedMap = {
          terrainFeatures: {
            ...currentMap.terrainFeatures,
            [terrainType]: updatedFeatures
          }
        };
      }
    }
    
    // 更新地图
    updateCurrentMap(updatedMap);
    
    // 更新拖动起点
    setDragStart({x, y});
    
    // 重新渲染
    renderCanvas();
  };
  
  // 鼠标释放事件处理
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };
  
  return (
    <div className="rounded-lg border overflow-hidden bg-card relative">
      <div className="flex items-center justify-between bg-muted/40 p-3 border-b">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">世界地图</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="border rounded-md flex items-center mr-2">
            <Button 
              variant={viewMode === "edit" ? "default" : "ghost"}
              size="sm" 
              className="px-2 py-1 h-8"
              onClick={() => setViewMode("edit")}
              title="编辑模式"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">编辑</span>
            </Button>
            <Button 
              variant={viewMode === "preview" ? "default" : "ghost"}
              size="sm" 
              className="px-2 py-1 h-8"
              onClick={() => setViewMode("preview")}
              title="预览模式"
            >
              <Eye className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">预览</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={addMap} title="添加新地图" className="flex gap-1 items-center">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">添加地图</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => loadMaps()}
            title="重新加载地图"
            className="flex gap-1 items-center"
          >
            <div className="h-4 w-4 flex items-center justify-center">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
              )}
            </div>
            <span className="hidden sm:inline">刷新</span>
          </Button>
          <div className="flex items-center gap-1">
            <div className="relative h-4 w-4 flex items-center justify-center">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin absolute" />
              ) : (
                <Save className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">{saving ? "保存中..." : "自动保存"}</span>
          </div>
        </div>
      </div>
      
      <Tabs 
        value={activeMap} 
        onValueChange={(newValue) => {
          console.log('[选项卡切换] 切换到地图:', newValue)
          setActiveMap(newValue)
          // 确保在切换后强制重新渲染
          setTimeout(() => {
            if (canvasRef.current) renderCanvas()
          }, 50)
        }} 
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 h-auto border-b">
          {maps.map(map => (
            <div key={map.id} className="flex items-center gap-1">
              <TabsTrigger 
                value={map.id} 
                className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-4 py-2"
              >
                <Map className="h-4 w-4 mr-2" />
                {map.name}
              </TabsTrigger>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteMap(map.id)
                }}
                title="删除此地图"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </TabsList>
        
        {maps.map(map => (
          <TabsContent key={map.id} value={map.id} className="p-0 mt-0">
            <div className="p-4 space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="地图名称"
                  value={map.name}
                  onChange={(e) => handleMapNameChange(e.target.value)}
                  className="text-lg font-medium bg-transparent border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              {viewMode === "edit" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4">
                  <div className="col-span-1">
                    <h3 className="text-sm font-medium mb-2">绘制工具</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={drawingTool === "mountains" ? "default" : "outline"} 
                        size="sm" 
                        className="w-full flex items-center justify-start gap-2"
                        onClick={() => setDrawingTool("mountains")}
                      >
                        <MountainSnow className="h-4 w-4" />
                        <span>山脉</span>
                      </Button>
                      <Button 
                        variant={drawingTool === "waters" ? "default" : "outline"} 
                        size="sm" 
                        className="w-full flex items-center justify-start gap-2"
                        onClick={() => setDrawingTool("waters")}
                      >
                        <Waves className="h-4 w-4" />
                        <span>水域</span>
                      </Button>
                      <Button 
                        variant={drawingTool === "forests" ? "default" : "outline"} 
                        size="sm" 
                        className="w-full flex items-center justify-start gap-2"
                        onClick={() => setDrawingTool("forests")}
                      >
                        <Trees className="h-4 w-4" />
                        <span>森林</span>
                      </Button>
                      <Button 
                        variant={drawingTool === "deserts" ? "default" : "outline"} 
                        size="sm" 
                        className="w-full flex items-center justify-start gap-2"
                        onClick={() => setDrawingTool("deserts")}
                      >
                        <Palette className="h-4 w-4" />
                        <span>沙漠</span>
                      </Button>
                      <Button 
                        variant={drawingTool === "location" ? "default" : "outline"} 
                        size="sm" 
                        className="w-full flex items-center justify-start gap-2"
                        onClick={() => setDrawingTool("location")}
                      >
                        <MapPin className="h-4 w-4" />
                        <span>地点</span>
                      </Button>
                      <Button 
                        variant={drawingTool === "region" ? "default" : "outline"} 
                        size="sm" 
                        className="w-full flex items-center justify-start gap-2"
                        onClick={() => setDrawingTool("region")}
                      >
                        <Crosshair className="h-4 w-4" />
                        <span>区域</span>
                      </Button>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">地图设置</h3>
                      <div className="space-y-2">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm">背景颜色</span>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="color" 
                              value={map.background || "#e6d6a9"}
                              onChange={(e) => updateCurrentMap({ background: e.target.value })}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                            <Input 
                              type="text" 
                              value={map.background || "#e6d6a9"}
                              onChange={(e) => updateCurrentMap({ background: e.target.value })}
                              className="h-8 w-24 text-xs"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <FileUp className="h-3 w-3 mr-1" />
                            背景图片
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">操作</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full flex items-center justify-start gap-2"
                          onClick={handleUndo}
                          disabled={historyIndex <= 0}
                          title="撤销上一步操作"
                        >
                          <Undo className="h-4 w-4" />
                          <span>撤销</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full flex items-center justify-start gap-2"
                          onClick={handleRedo}
                          disabled={historyIndex >= history.length - 1}
                          title="重做上一步操作"
                        >
                          <Redo className="h-4 w-4" />
                          <span>重做</span>
                        </Button>
                        <Button 
                          variant={drawingTool === "select" ? "default" : "outline"}
                          size="sm" 
                          className="w-full flex items-center justify-start gap-2"
                          onClick={() => setDrawingTool("select")}
                          title="选择地图元素"
                        >
                          <Crosshair className="h-4 w-4" />
                          <span>选择</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full flex items-center justify-start gap-2"
                          onClick={deleteSelectedElement}
                          disabled={!selectedElement}
                          title="删除选中的元素"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>删除</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-3 border rounded-lg p-4 relative bg-muted/20" ref={mapContainerRef}>
                    <canvas 
                      ref={canvasRef}
                      width={map.width} 
                      height={map.height}
                      onClick={handleCanvasClick}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className="border mx-auto max-w-full"
                      style={{
                        cursor: viewMode === "edit" ? (
                          isDragging ? "grabbing" :
                          drawingTool === "location" ? "crosshair" : 
                          drawingTool === "select" ? (selectedElement ? "grab" : "default") : "pointer"
                        ) : "default"
                      }}
                    />
                  </div>
                </div>
              )}
              
              {viewMode === "preview" && (
                <div className="border rounded-lg p-4 flex justify-center bg-muted/20">
                  <canvas 
                    ref={canvasRef}
                    width={map.width} 
                    height={map.height}
                    className="border max-w-full"
                  />
                </div>
              )}
              
              {/* List of locations in this map */}
              {viewMode === "edit" && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">地点列表</h3>
                  {map.locations && map.locations.length > 0 ? (
                    <div className="space-y-2">
                      {map.locations.map(location => (
                        <div key={location.id} className="border p-2 rounded-md flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{location.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteLocation(location.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">尚未添加任何地点。使用地点工具在地图上标记地点。</p>
                  )}
                </div>
              )}
              
              {/* 添加区域绘制说明 */}
              {viewMode === "edit" && drawingTool === "region" && (
                <div className="bg-muted/50 p-2 text-sm text-center">
                  {!isDrawingRegion ? 
                    "点击地图开始绘制区域" : 
                    "继续点击添加区域顶点，点击靠近起点（红点）完成绘制，或按ESC取消"}
                </div>
              )}
              
              <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded border border-dashed">
                <p className="font-medium mb-2">创建地图指南：</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>选择适当的绘制工具（山脉、水域、森林、沙漠等）</li>
                  <li>在地图上点击或拖动鼠标来添加地形特征</li>
                  <li>使用地点工具添加城市、村庄等重要位置</li>
                  <li>使用区域工具划分国家、王国或其他行政区域</li>
                  <li>编辑地点和区域的名称、描述和其他属性</li>
                </ol>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* 名称编辑器浮层 */}
      {showNameEditor && (
        <div 
          className="fixed z-50 animate-in fade-in slide-in-from-top-5 duration-200 ease-out"
          style={{
            left: `${nameEditorPosition.x}px`,
            top: `${nameEditorPosition.y}px`,
            transform: 'translate(-50%, 0)'
          }}
        >
          {/* 小三角形指示箭头 */}
          <div
            className="absolute w-3 h-3 bg-white rotate-45 border-t border-l border-border"
            style={{ 
              left: '50%', 
              bottom: '-6px', 
              marginLeft: '-6px',
              display: nameEditorPosition.y > 150 ? 'block' : 'none'
            }}
          />
          {/* 上方箭头 */}
          <div
            className="absolute w-3 h-3 bg-white rotate-45 border-b border-r border-border"
            style={{ 
              left: '50%', 
              top: '-6px', 
              marginLeft: '-6px',
              display: nameEditorPosition.y <= 150 ? 'block' : 'none'
            }}
          />
          
          {/* 卡片主体 */}
          <div className="relative bg-white dark:bg-card border border-border rounded-lg shadow-xl p-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1.5">
                  {selectedElement?.type === "location" ? (
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Map className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span className="text-xs font-medium text-muted-foreground">
                    {selectedElement?.type === "location" ? "编辑地点名称" : "编辑区域名称"}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 rounded-full hover:bg-muted" 
                  onClick={handleNameEditorClose}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12"></path>
                  </svg>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={editingName}
                  onChange={(e) => updateElementName(e.target.value)}
                  onKeyDown={(e) => {
                    // 阻止键盘事件冒泡，防止触发全局监听器
                    e.stopPropagation();
                    // 按下回车键保存
                    if (e.key === 'Enter') {
                      handleNameEditorClose();
                    }
                  }}
                  className="w-60 h-9 text-sm"
                  placeholder={selectedElement?.type === "location" ? "输入地点名称" : "输入区域名称"}
                  autoFocus
                />
                <Button 
                  size="sm" 
                  className="h-9 px-4" 
                  onClick={handleNameEditorClose}
                >
                  确定
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 