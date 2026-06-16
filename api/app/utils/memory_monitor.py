# api/app/utils/memory_monitor.py - NEW FILE
# Monitor memory usage and log warnings

import psutil
import logging
from datetime import datetime
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# Memory usage thresholds
MEMORY_WARNING_THRESHOLD = 80  # Warn at 80% usage
MEMORY_CRITICAL_THRESHOLD = 90  # Critical at 90% usage

class MemoryMonitor:
    """Monitor memory usage and log warnings"""
    
    def __init__(self):
        self.start_time = datetime.utcnow()
        self.peak_memory_mb = 0
        self.last_warning_time = None
    
    def get_process_memory(self) -> float:
        """Get current process memory in MB"""
        process = psutil.Process()
        return process.memory_info().rss / 1024 / 1024
    
    def get_system_memory(self) -> Dict[str, float]:
        """Get system memory info in MB"""
        vm = psutil.virtual_memory()
        return {
            "total_mb": vm.total / 1024 / 1024,
            "available_mb": vm.available / 1024 / 1024,
            "used_mb": vm.used / 1024 / 1024,
            "percent_used": vm.percent
        }
    
    def get_memory_status(self) -> Dict:
        """Get detailed memory status"""
        process_mem = self.get_process_memory()
        system_mem = self.get_system_memory()
        
        # Update peak
        if process_mem > self.peak_memory_mb:
            self.peak_memory_mb = process_mem
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "process_memory_mb": round(process_mem, 1),
            "peak_memory_mb": round(self.peak_memory_mb, 1),
            "system_total_mb": round(system_mem["total_mb"], 1),
            "system_available_mb": round(system_mem["available_mb"], 1),
            "system_used_mb": round(system_mem["used_mb"], 1),
            "percent_used": round(system_mem["percent_used"], 1),
            "uptime_seconds": int((datetime.utcnow() - self.start_time).total_seconds()),
            "status": self._get_status(system_mem["percent_used"])
        }
    
    def _get_status(self, percent_used: float) -> str:
        """Determine status based on usage percentage"""
        if percent_used >= MEMORY_CRITICAL_THRESHOLD:
            return "critical"
        elif percent_used >= MEMORY_WARNING_THRESHOLD:
            return "warning"
        else:
            return "ok"
    
    def check_and_log(self, label: str = "") -> Optional[Dict]:
        """Check memory and log if needed"""
        status = self.get_memory_status()
        
        if status["status"] == "critical":
            logger.critical(
                f"{label} CRITICAL memory usage: {status['percent_used']:.1f}% "
                f"({status['system_used_mb']:.0f}/{status['system_total_mb']:.0f} MB)"
            )
        elif status["status"] == "warning":
            logger.warning(
                f"{label} HIGH memory usage: {status['percent_used']:.1f}% "
                f"({status['system_used_mb']:.0f}/{status['system_total_mb']:.0f} MB)"
            )
        else:
            logger.debug(
                f"{label} Memory OK: {status['percent_used']:.1f}% "
                f"({status['system_used_mb']:.0f}/{status['system_total_mb']:.0f} MB)"
            )
        
        return status


# Global monitor instance
_monitor = MemoryMonitor()


def get_memory_status() -> Dict:
    """Get current memory status"""
    return _monitor.get_memory_status()


def log_memory_checkpoint(label: str = ""):
    """Log memory usage at a checkpoint"""
    _monitor.check_and_log(label)


def get_memory_alert_if_critical() -> Optional[str]:
    """Get alert message if memory is critical, None otherwise"""
    status = _monitor.get_memory_status()
    
    if status["status"] == "critical":
        return (
            f"CRITICAL: Memory at {status['percent_used']:.1f}%. "
            f"Consider restarting or upgrading Render tier."
        )
    elif status["status"] == "warning":
        return (
            f"WARNING: Memory at {status['percent_used']:.1f}%. "
            f"Monitor closely for OOM errors."
        )
    
    return None


# ============================================================================
# MIDDLEWARE FOR AUTOMATIC MONITORING
# ============================================================================

class MemoryMonitoringMiddleware:
    """FastAPI middleware to monitor memory usage"""
    
    def __init__(self, app, monitor_interval: int = 10):
        """
        Args:
            app: FastAPI app instance
            monitor_interval: Log memory every N requests
        """
        self.app = app
        self.monitor_interval = monitor_interval
        self.request_count = 0
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        self.request_count += 1
        
        # Log memory every N requests
        if self.request_count % self.monitor_interval == 0:
            label = f"[Request #{self.request_count}]"
            _monitor.check_and_log(label)
        
        await self.app(scope, receive, send)


# ============================================================================
# ADD TO api/app/main.py
# ============================================================================

"""
# At the top of main.py:
from api.app.utils.memory_monitor import MemoryMonitoringMiddleware

# After creating FastAPI app:
app = FastAPI(title="AI Tutor API", ...)

# Add monitoring middleware:
app.add_middleware(MemoryMonitoringMiddleware, monitor_interval=5)

# Optional: Add health check endpoint
from api.app.utils.memory_monitor import get_memory_status

@app.get("/health/memory")
def memory_health():
    status = get_memory_status()
    
    # Return 200 if OK, 503 if critical
    http_status = 200 if status["status"] != "critical" else 503
    
    return status, http_status
"""


# ============================================================================
# DEBUGGING: Log model memory usage
# ============================================================================

def log_model_memory_usage():
    """Log memory used by each model"""
    logger.info("=== MODEL MEMORY USAGE ===")
    
    # Check FLAN model
    try:
        from rag.generator_flan import model_memory_info
        flan_info = model_memory_info()
        logger.info(f"FLAN-T5: {flan_info}")
    except Exception as e:
        logger.debug(f"Could not get FLAN memory: {e}")
    
    # Check embedder
    try:
        from rag.subject_retriever import EMBEDDER
        if EMBEDDER is not None:
            logger.info(f"Embedder loaded: {type(EMBEDDER)}")
    except Exception as e:
        logger.debug(f"Could not check embedder: {e}")
    
    # Overall system status
    status = get_memory_status()
    logger.info(
        f"System: {status['percent_used']:.1f}% used "
        f"({status['system_used_mb']:.0f}/{status['system_total_mb']:.0f} MB)"
    )
    logger.info(f"Process: {status['process_memory_mb']:.1f} MB")
    logger.info(f"Peak: {status['peak_memory_mb']:.1f} MB")


if __name__ == "__main__":
    # Test the monitor
    import time
    
    print("Memory Monitor Test")
    print("=" * 50)
    
    monitor = MemoryMonitor()
    
    for i in range(5):
        status = monitor.get_memory_status()
        print(f"\nCheck #{i+1}:")
        print(f"  System: {status['percent_used']:.1f}% ({status['system_used_mb']:.0f} MB)")
        print(f"  Process: {status['process_memory_mb']:.1f} MB")
        print(f"  Peak: {status['peak_memory_mb']:.1f} MB")
        print(f"  Status: {status['status'].upper()}")
        
        time.sleep(1)
