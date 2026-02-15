# 🧪 Complete Workflow Testing Guide

## 🎯 Step-by-Step Testing Instructions

### 1️⃣ **Test Authentication Flow**

#### A. Test Logout & Login
1. Open `http://localhost:5000`
2. Click purple profile icon (top-right)
3. Click "Logout"
4. ✅ Should redirect to `/sign-in`
5. Sign in again
6. ✅ Should redirect back to workflow editor

---

### 2️⃣ **Test UI Components**

#### A. Left Sidebar
1. ✅ Click collapse icon - sidebar should minimize
2. ✅ Type in search box - should filter nodes
3. ✅ Verify exactly 6 node buttons:
   - Text
   - Upload Image
   - Upload Video
   - Run Any LLM
   - Crop Image
   - Extract Frame

#### B. Right Sidebar
1. ✅ Check "Workflow History" panel exists
2. ✅ Shows "No runs yet" initially

#### C. Canvas
1. ✅ Dot grid background visible
2. ✅ MiniMap in bottom-right corner
3. ✅ Pan: Click and drag background
4. ✅ Zoom: Use mouse wheel

---

### 3️⃣ **Test Node Operations**

#### A. Add Nodes to Canvas
1. **Drag Text Node** from sidebar to canvas
2. **Drag Upload Image Node** to canvas
3. **Drag LLM Node** to canvas
4. ✅ All nodes should appear with purple theme

#### B. Connect Nodes
1. Hover over **Text Node** output handle (right side)
2. Click and drag to **LLM Node** input handle (left side)
3. ✅ Purple animated edge should appear
4. Try creating a cycle (connect back to Text Node)
5. ✅ Should show error: "Cannot create cycle"

#### C. Edit Node Data
1. Click on **Text Node**
2. Type text in textarea: "A futuristic city at sunset"
3. ✅ Text should save automatically

#### D. Delete Nodes
**Method 1: Keyboard**
1. Click to select a node
2. Press `Delete` or `Backspace`
3. ✅ Node should disappear

**Method 2: Menu**
1. Click the menu button on node
2. Select "Delete"
3. ✅ Node should disappear

---

### 4️⃣ **Test Undo/Redo**

1. Add a node to canvas
2. Click **Undo** button (top bar)
3. ✅ Node should disappear
4. Click **Redo** button
5. ✅ Node should reappear

---

### 5️⃣ **Test Export/Import Workflow**

#### A. Export
1. Create a workflow with 2-3 connected nodes
2. Click **Export** button (top bar)
3. ✅ Should download `workflow-[timestamp].json`
4. Open the file - should see nodes and edges JSON

#### B. Import
1. Delete all nodes from canvas
2. Click **Import** button
3. Select the exported JSON file
4. ✅ Workflow should reload with all nodes and connections

---

### 6️⃣ **Test File Upload Nodes**

#### A. Upload Image Node
1. Add **Upload Image Node** to canvas
2. Click the upload area
3. Select an image file (.jpg, .png, .webp, or .gif)
4. ✅ **With Transloadit**: Upload via Transloadit (if configured)
5. ✅ **Without Transloadit**: Converts to base64
6. ✅ Image preview should appear

#### B. Upload Video Node
1. Add **Upload Video Node** to canvas
2. Click upload area
3. Select a video file (.mp4, .mov, .webm, or .m4v)
4. ✅ Video player preview should appear

---

### 7️⃣ **Test LLM Node** ⚠️ (Requires API Keys)

#### Prerequisites:
```bash
# Ensure these are set in .env:
GOOGLE_AI_API_KEY=your_actual_key
TRIGGER_API_KEY=your_actual_key
```

#### Test Steps:
1. Add **Text Node** with prompt: "Describe a sunset"
2. Add **LLM Node**
3. Connect Text → LLM
4. Click LLM node
5. Select model (e.g., "gemini-1.5-flash")
6. Click **Run** button (bottom bar)
7. ✅ Node should show pulsating purple glow during execution
8. ✅ Should see LLM response in node output

---

### 8️⃣ **Test Crop Image Node** ⚠️ (Requires FFmpeg)

#### Prerequisites:
- FFmpeg installed on system OR
- Trigger.dev running with FFmpeg support

#### Test Steps:
1. Add **Upload Image Node** → upload an image
2. Add **Crop Image Node**
3. Connect Upload → Crop
4. Click Crop node
5. Set crop parameters:
   - x: 10%
   - y: 10%
   - width: 50%
   - height: 50%
6. Click **Run**
7. ✅ Should show cropped image (or original if FFmpeg not available)

---

### 9️⃣ **Test Extract Frame Node** ⚠️ (Requires FFmpeg)

#### Test Steps:
1. Add **Upload Video Node** → upload a video
2. Add **Extract Frame Node**
3. Connect Upload → Extract
4. Click Extract node
5. Set timestamp: 5 seconds (or 50%)
6. Click **Run**
7. ✅ Should extract frame at specified time

---

### 🔟 **Test Workflow Execution**

#### A. Simple Workflow
**Create this workflow:**
```
[Text Node] → [LLM Node]
```

1. Add Text Node: "Write a haiku about coding"
2. Connect to LLM Node
3. Click **Run Entire Workflow** (bottom bar)
4. ✅ Both nodes should glow purple during execution
5. ✅ Purple edge should be animated
6. ✅ LLM should generate haiku
7. ✅ Check Workflow History (right sidebar) for run entry

#### B. Complex Workflow (All Nodes)
**Create this workflow:**
```
[Text] → [LLM]
[Upload Image] → [Crop Image]
[Upload Video] → [Extract Frame]
```

1. Run entire workflow
2. ✅ All independent branches execute in parallel
3. ✅ Each node shows status (running/success/error)

---

### 1️⃣1️⃣ **Test Sample Workflow**

1. Clear browser cache
2. Visit `http://localhost:5000` for first time
3. ✅ Should auto-load sample workflow with all 6 nodes
4. Explore the pre-built connections
5. Try running it

---

## ⚠️ **Known Limitations (Without Full API Keys)**

| Feature | Works Without Keys | Requires Keys |
|---------|-------------------|---------------|
| Add/Delete Nodes | ✅ Yes | - |
| Connect Nodes | ✅ Yes | - |
| Undo/Redo | ✅ Yes | - |
| Export/Import | ✅ Yes | - |
| Upload Files | ✅ Base64 fallback | Transloadit |
| LLM Execution | ❌ No | Gemini API + Trigger.dev |
| Crop Image | ⚠️ Returns original | FFmpeg + Trigger.dev |
| Extract Frame | ⚠️ Returns placeholder | FFmpeg + Trigger.dev |

---

## ✅ **What You CAN Test Without API Keys**

1. ✅ Complete authentication flow
2. ✅ All UI components and interactions
3. ✅ Node operations (add/delete/connect)
4. ✅ Undo/Redo functionality
5. ✅ Export/Import workflows
6. ✅ File uploads (base64 mode)
7. ✅ DAG validation (cycle prevention)
8. ✅ Logout functionality
9. ✅ Profile display
10. ✅ Sample workflow loading

---

## 🚀 **Quick Test Scenario**

**5-Minute Full Test:**

1. Login → ✅ Profile shows your name
2. Add Text Node → Type "Hello World"
3. Add LLM Node → Connect them
4. Delete connection → Press Undo → Connection reappears ✅
5. Add Upload Image → Upload a photo → Preview appears ✅
6. Export workflow → Downloads JSON ✅
7. Clear canvas → Import JSON → Workflow restored ✅
8. Click Logout → Redirects to sign-in ✅
9. Login again → All good! ✅

---

## 🎯 **Expected Results Summary**

✅ **Should Work Perfectly:**
- Authentication (login/logout/signup)
- UI/UX (sidebar, canvas, history panel)
- Node operations (add/delete/connect/edit)
- Undo/Redo
- Export/Import
- File uploads (base64)
- DAG validation

⚠️ **Requires API Configuration:**
- LLM execution (needs Gemini API + Trigger.dev)
- Image cropping (needs FFmpeg + Trigger.dev)
- Frame extraction (needs FFmpeg + Trigger.dev)
- Transloadit uploads (needs Transloadit key)

---

## 📝 **Testing Checklist**

Print this and check off as you test:

- [ ] Login works
- [ ] Logout redirects to sign-in
- [ ] Profile shows name/email
- [ ] Sidebar collapses/expands
- [ ] All 6 node types available
- [ ] Can drag nodes to canvas
- [ ] Can connect nodes (purple edges)
- [ ] Cannot create cycles
- [ ] Can delete nodes (keyboard + menu)
- [ ] Undo button works
- [ ] Redo button works
- [ ] Export downloads JSON
- [ ] Import loads workflow
- [ ] Upload image shows preview
- [ ] Upload video shows player
- [ ] MiniMap visible in bottom-right
- [ ] Canvas pan/zoom works
- [ ] Sample workflow auto-loads (first visit)

