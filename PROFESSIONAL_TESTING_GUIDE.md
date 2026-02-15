# 🎯 PROFESSIONAL WORKFLOW TESTING GUIDE

## Complete 6-Node Integration Test

This guide demonstrates a professional workflow using ALL 6 nodes in a real-world scenario.

---

## 📋 TEST SCENARIO: "AI-Powered Video Analysis Workflow"

**Goal**: Upload a video → Extract a frame → Crop it → Analyze with AI → Generate description

---

## 🔧 STEP-BY-STEP SETUP

### Step 1: Open the Application
```
http://localhost:5000
```
You should see an empty black canvas with dot grid.

---

### Step 2: Add Nodes (Left to Right)

**Add these nodes from the left sidebar:**

1. **Text Node** (Blue Type icon)
2. **Upload Video Node** (Red Video icon)  
3. **Extract Frame Node** (Red Film icon)
4. **Crop Image Node** (Orange Crop icon)
5. **Run Any LLM Node** (Purple Sparkles icon)
6. **Text Node** (for output) (Blue Type icon)

**Arrange them horizontally** across the canvas for a clean workflow.

---

### Step 3: Configure Each Node

#### Node 1: Text (Input Prompt)
```
Text: "Describe this image in detail"
```
This will be used later in the LLM.

---

#### Node 2: Upload Video
```
- Click the upload area
- Select a short video file (mp4, mov, webm)
- OR use base64 if no Transloadit key
- Wait for preview to appear
```

---

#### Node 3: Extract Frame
```
- Timestamp: 50 (or any value)
- Toggle "Use Percentage": ON
- This will extract frame at 50% of video
```

---

#### Node 4: Crop Image
```
- X: 0
- Y: 0  
- Width: 50
- Height: 50
```
This crops the top-left quarter of the extracted frame.

---

#### Node 5: Run Any LLM
```
- Model: Gemini 2.5 Flash (default)
- System Prompt: (leave empty or add "You are a helpful assistant")
- User Message: "{input}"
```
The {input} will be replaced with text from Node 1.

---

#### Node 6: Text (Output Display)
```
- Leave empty
- This will show the LLM's response
```

---

### Step 4: Connect the Nodes

**Create these connections by dragging:**

```
Text (Node 1) → LLM (Node 5) [Connect to purple text input handle]
   ↓
Upload Video (Node 2) → Extract Frame (Node 3)
   ↓
Extract Frame (Node 3) → Crop Image (Node 4)
   ↓
Crop Image (Node 4) → LLM (Node 5) [Connect to green image input handle]
   ↓
LLM (Node 5) → Text (Node 6)
```

**Visual Flow:**
```
┌──────┐
│Text 1│────────┐
└──────┘        ↓
             ┌─────┐
┌──────────┐ │     │    ┌──────┐
│Upload Vid│→│Frame│→Crop│      │
└──────────┘ │     │ →   │  LLM │→Text 6
             └─────┘     │      │
                         └──────┘
```

---

### Step 5: Execute the Workflow

**Method 1: Run Individual Nodes (Recommended for Testing)**

1. Click "Run LLM" button in the LLM node
2. Watch the purple glow animation
3. See the result appear in the LLM output
4. The final Text node should auto-update with the output

**Method 2: Run Entire Workflow**

1. Click "Run Workflow" in the bottom bar
2. Watch nodes execute in topological order
3. See purple glows moving through the workflow
4. Final result appears in last Text node

---

## 🎯 SIMPLER TEST (If Video Upload is Complex)

### Lightweight Test: Text → LLM Chain

**4 Nodes Test:**

```
┌──────┐     ┌─────┐     ┌──────┐
│Text 1│────→│ LLM │────→│Text 2│
└──────┘     └─────┘     └──────┘
```

**Setup:**
1. **Text Node 1**: Type "artificial intelligence"
2. **LLM Node**: 
   - User Message: "Write a haiku about {input}"
   - Click "Run LLM"
3. **Text Node 2**: Will display the generated haiku

**Expected Flow:**
- LLM receives: "Write a haiku about artificial intelligence"
- Gemini generates a haiku
- Output appears in Text Node 2

---

## 🔬 VERIFICATION CHECKLIST

After running the workflow, verify:

- [ ] Text node passes data to LLM (check {input} replacement)
- [ ] Upload Video shows video preview
- [ ] Extract Frame button is clickable
- [ ] Crop Image receives image input
- [ ] LLM node shows purple glow during execution
- [ ] LLM output appears in the output section
- [ ] All connections show animated purple edges
- [ ] No errors in browser console (F12)

---

## 🎨 WHAT YOU SHOULD SEE

### During Execution:
1. **Purple glow animation** on active nodes
2. **Animated purple edges** between nodes
3. **Loading spinners** on buttons
4. **Progress indicators** in nodes

### After Execution:
1. **Output text** in LLM node
2. **Success status** (green indicators)
3. **Data flowing** through all connected nodes
4. **Final result** visible

---

## 🚨 TROUBLESHOOTING

### LLM says "provide specific word"
- **Issue**: {input} placeholder not replaced
- **Fix**: Make sure Text node is connected to LLM's purple handle

### Node not receiving input
- **Issue**: Connection not established
- **Fix**: Check purple edges are visible between nodes

### Gemini API error
- **Issue**: Invalid API key
- **Fix**: Check GOOGLE_AI_API_KEY in .env file

---

## 💡 PRO TIPS

1. **Start Simple**: Test with 2-3 nodes first, then add more
2. **Use Console**: Press F12 to see detailed execution logs
3. **Check Connections**: Purple animated edges = working connections
4. **Test Incrementally**: Add one node at a time and test
5. **Save Often**: Use Export button to save your workflow

---

## 🎯 SUCCESS CRITERIA

Your workflow test is successful when:

✅ All 6 node types are on the canvas
✅ Nodes are connected with purple edges
✅ Data flows from node to node
✅ LLM receives and processes input correctly
✅ Final output is visible and correct
✅ No errors in console or UI

---

## 📊 EXPECTED TIMELINE

- Setup (Adding nodes): **2 minutes**
- Configuration: **3 minutes**
- Connecting nodes: **2 minutes**
- Testing execution: **2 minutes**
- **Total: ~10 minutes**

---

## 🎬 READY TO TEST!

Open http://localhost:5000 and follow the steps above.

Good luck! 🚀

