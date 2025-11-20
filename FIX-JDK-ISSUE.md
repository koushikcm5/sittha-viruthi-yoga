# Fix: No compiler is provided (JRE vs JDK)

## Problem
You have JRE (Java Runtime) but need JDK (Java Development Kit) to compile.

## Solution: Install JDK 17

### Download & Install:
1. Visit: https://www.oracle.com/java/technologies/downloads/#java17
2. Download: **Windows x64 Installer** (jdk-17_windows-x64_bin.exe)
3. Run installer
4. Install to: `C:\Program Files\Java\jdk-17`

### Set JAVA_HOME:
1. Press `Win + X` → System
2. Advanced system settings → Environment Variables
3. System Variables → New:
   - Variable: `JAVA_HOME`
   - Value: `C:\Program Files\Java\jdk-17`
4. Edit `Path` → Add: `%JAVA_HOME%\bin`
5. **Restart computer**

### Verify:
```bash
java -version
javac -version
```

Both should show version 17.

### Then Run Backend:
```bash
cd C:\ReactNativeAuthApp\backend
"C:\Program Files\NetBeans-13\netbeans\java\maven\bin\mvn.cmd" spring-boot:run
```
